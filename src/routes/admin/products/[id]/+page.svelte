<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
	import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
	import { page } from '$app/stores';
	import { db, storage } from '$lib/firebase/rada';
	import { allProductsStore, baseRoute, language } from '../../../stores';
	import toast from 'svelte-french-toast';
	import { autoResizeTextarea } from '../../../functions';
	import type { Product } from '../../../mockDb';
	import { goto } from '$app/navigation';

	let form: HTMLFormElement;

	let product: Product | undefined;
	const newProductParameter = 'new';
	let isNewProduct = false;
	const emptyProduct: Product = {
		id: '',
		unitsInStock: 1,
		name: { en: '', es: '' },
		description: { en: '', es: '' },
		price: '$0.00',
		oldPrice: null,
		mainVersion: true,
		status: true,
		imageSources: [],
		dbImageSources: [],
		imageHoverSource: '',
		dbImageHoverSource: '',
		imageAlt: { en: '', es: '' },
		href: '',
		categoryIds: [],
		versionsIds: [],
		details: [{ label: { en: '', es: '' }, value: { en: '', es: '' } }],
	};

	let id: string = '';
	let categoryIds: string = '';
	let versionsIds: string = '';
	let detailsString: string = '';
	let validDetails: boolean = true;
	let imageFiles: File[] = [];

	$: product?.unitsInStock, checkStatus();
	function checkStatus() {
		if (product?.unitsInStock === 0) {
			product.status = false;
			toast('Product status deactivated because units in stock is 0.');
		}
	}

	function handlePriceInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		if (value === '') {
			target.value = '$';
		} else if (value[0] === '$') {
			target.value = value;
		} else {
			target.value = '$' + value;
		}
	}

	function checkPriceInput() {
		if (product?.price === '$') {
			product.price = '$0.00';
		}
		if (product?.oldPrice === '$') {
			product.oldPrice = null;
		}
	}

	function handleCategoryIdsInput(e: Event) {
		if (!product) return;

		const target = e.target as HTMLInputElement;
		product.categoryIds = target.value.split(',').map((id) => parseInt(id.trim()));
	}

	function handleVersionsIdsInput(e: Event) {
		if (!product) return;

		const target = e.target as HTMLInputElement;
		product.versionsIds = target.value.split(',').map((src) => src.trim());
	}

	function handleDetailsInput(e: Event) {
		if (!product) return;

		const target = e.target as HTMLTextAreaElement;
		detailsString = target.value;
		try {
			product.details = JSON.parse(detailsString);
			validDetails = true;
		} catch (error) {
			toast.error('Invalid details JSON format');
			validDetails = false;
		}
	}

	async function fetchImageUrls(type: 'main' | 'hover' | 'all' = 'all') {
		if (!product) return;

		if (type === 'main' || type === 'all') {
			product.imageSources = await Promise.all(
				product.dbImageSources.map(async (imageSource) => {
					const imageRef = ref(storage, `products/${imageSource}`);
					return await getDownloadURL(imageRef);
				}),
			);
		}
		if (type === 'hover' || type === 'all') {
			if (product.dbImageHoverSource) {
				const imageRef = ref(storage, `products/${product.dbImageHoverSource}`);
				product.imageHoverSource = await getDownloadURL(imageRef);
			} else {
				product.imageHoverSource = '';
			}
		}
	}

	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			imageFiles = Array.from(target.files);
			for (const file of imageFiles) {
				const storageRef = ref(storage, `products/${file.name}`);
				await uploadBytes(storageRef, file);
				product?.dbImageSources.push(file.name);
			}
			await fetchImageUrls('main');
		}
	}

	async function handleImageDelete(imageSource?: string | null) {
		if (!product || !imageSource) return;

		const imageRef = ref(storage, `products/${imageSource}`);
		await deleteObject(imageRef);
		product!.dbImageSources = product!.dbImageSources.filter((src) => src !== imageSource);
		await fetchImageUrls('main');
	}

	async function handleHoverImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			imageFiles = Array.from(target.files);
			for (const file of imageFiles) {
				const storageRef = ref(storage, `products/${file.name}`);
				await uploadBytes(storageRef, file);
				if (product) product.dbImageHoverSource = file.name;
			}
			await fetchImageUrls('hover');
		}
	}

	async function handleHoverImageDelete(imageSource?: string | null) {
		if (!product || !imageSource) return;

		const imageRef = ref(storage, `products/${imageSource}`);
		await deleteObject(imageRef);
		if (product) product.dbImageHoverSource = null;
		await fetchImageUrls('hover');
	}

	onMount(async () => {
		id = $page.params.id;
		isNewProduct = id === newProductParameter;
		product = isNewProduct ? emptyProduct : $allProductsStore.find((p) => p.id === id);

		if (product) {
			categoryIds = product.categoryIds ? product.categoryIds.join(', ') : '';
			versionsIds = product.versionsIds ? product.versionsIds.join(', ') : '';
			detailsString = JSON.stringify(product.details, null, 2);
			await fetchImageUrls();
		} else if (!isNewProduct) {
			toast.error('Invalid product ID');
		}
	});

	async function saveProduct() {
		if (!product) return;

		// Check if required fields are filled
		if (
			!product.name.en ||
			!product.name.es ||
			!product.price ||
			!product.unitsInStock ||
			!product.href
		) {
			toast.error('Please fill in all required fields.');
			return;
		}

		if (product.price === '$0.00') {
			toast.error('$0.00 is not a valid price.');
			return;
		}

		if (!validDetails) {
			toast.error('Invalid details JSON format');
			return;
		} else if (id === newProductParameter) {
			const newDocRef = doc(collection(db, 'products'));
			product.id = newDocRef.id;
			await setDoc(newDocRef, product);
			allProductsStore.update((products) => {
				if (!product) return products;
				return [...products, product];
			});
			toast.success('New product created successfully!');
			goto(baseRoute + '/admin/products');
		} else {
			const docRef = doc(db, 'products', id);
			await updateDoc(docRef, product);
			allProductsStore.update((products) => {
				const index = products.findIndex((p) => p.id === id);
				if (index !== -1 && product) {
					products[index] = product;
				}
				return products;
			});
			toast.success('Product saved successfully!');
			goto(baseRoute + '/admin/products');
		}
	}

	async function deleteProduct() {
		const docRef = doc(db, 'products', id);
		await deleteDoc(docRef);
		allProductsStore.update((products) => products.filter((p) => p.id !== id));

		toast.success('Product deleted successfully!');
		goto(baseRoute + '/admin/products');
	}
</script>

<head>
	<title>Admin | {isNewProduct ? 'Create New Product' : 'Edit Product'} - {$page.params.id}</title
	>
</head>

{#if product}
	<form bind:this={form} class="edit-product-page">
		<h1>{isNewProduct ? 'Create New Product' : 'Edit Product'}</h1>
		<div class="form-group">
			<label>
				Name (EN):
				<input type="text" required bind:value={product.name.en} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Name (ES):
				<input type="text" required bind:value={product.name.es} />
			</label>
		</div>
		<div class="form-group">
			<h2>Images</h2>
			<div class="image-gallery">
				<label class="image-item add-image">
					<ion-icon name="add" />
					<input type="file" multiple on:change={handleImageUpload} />
				</label>
				{#each product.imageSources as url, index}
					<div class="image-item">
						<img src={url} alt={product?.imageAlt[$language]} />
						<div class="image-actions">
							<a href={url} target="_blank" class="download-button">View</a>
							<button
								on:click={() => handleImageDelete(product?.dbImageSources[index])}
								class="delete-button">Delete</button
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="form-group">
			<h2>Hover Image</h2>
			<div class="image-gallery">
				{#if product && product.imageHoverSource}
					<div class="image-item">
						<img src={product.imageHoverSource} alt={product?.imageAlt[$language]} />
						<div class="image-actions">
							<a
								href={product.imageHoverSource}
								target="_blank"
								class="download-button">View</a
							>
							<button
								on:click={() => handleHoverImageDelete(product?.dbImageHoverSource)}
								class="delete-button">Delete</button
							>
						</div>
					</div>
				{:else}
					<label class="image-item add-image">
						<ion-icon name="add" />
						<input type="file" multiple on:change={handleHoverImageUpload} />
					</label>
				{/if}
			</div>
		</div>
		<div class="form-group">
			<label>
				Description (EN):
				<textarea use:autoResizeTextarea bind:value={product.description.en} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Description (ES):
				<textarea use:autoResizeTextarea bind:value={product.description.es} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Price:
				<input
					required
					type="text"
					bind:value={product.price}
					on:input={handlePriceInput}
					on:blur={checkPriceInput}
				/>
			</label>
		</div>
		<div class="form-group">
			<label>
				Old Price:
				<input
					type="text"
					bind:value={product.oldPrice}
					on:input={handlePriceInput}
					on:blur={checkPriceInput}
				/>
			</label>
		</div>
		<div class="form-group">
			<label>
				Units in Stock:
				<input required type="number" bind:value={product.unitsInStock} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Main Version:
				<input type="checkbox" bind:checked={product.mainVersion} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Status:
				<input type="checkbox" bind:checked={product.status} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Image Alt (EN):
				<input type="text" bind:value={product.imageAlt.en} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Image Alt (ES):
				<input type="text" bind:value={product.imageAlt.es} />
			</label>
		</div>
		<div class="form-group">
			<label>
				HREF:
				<input required type="text" bind:value={product.href} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Version IDs (comma separated):
				<input type="text" bind:value={versionsIds} on:input={handleVersionsIdsInput} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Category IDs (comma separated):
				<input type="text" bind:value={categoryIds} on:input={handleCategoryIdsInput} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Details (JSON format):
				<textarea
					use:autoResizeTextarea
					bind:value={detailsString}
					on:blur={handleDetailsInput}
					class:invalid={!validDetails}
				/>
			</label>
		</div>
		<div class="button-group">
			<button type="submit" class="button save-button" on:click={saveProduct}>
				{isNewProduct ? 'Create' : 'Save'}
			</button>
			{#if !isNewProduct}
				<button type="button" class="button delete-button" on:click={deleteProduct}
					>Delete</button
				>
			{/if}
		</div>
	</form>
{/if}

<style>
	.edit-product-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-color: var(--main);
		color: var(--content);
		width: 100%;
		max-width: 1500px;
		margin: auto;
	}

	h1 {
		margin-bottom: 2rem;
		font-size: 2.5rem;
		color: var(--interactive);
	}

	h2 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
		color: var(--interactive);
	}

	.form-group {
		margin-bottom: 1.5rem;
		width: 100%;
		max-width: 600px;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 1.2rem;
		color: var(--content);
	}

	input[type='text'],
	input[type='number'],
	textarea {
		margin-top: 0.5rem;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid var(--content-5);
		border-radius: 5px;
		background-color: var(--main-8);
		color: var (--content);
	}

	textarea.invalid {
		border-color: red;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	.image-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.image-item {
		position: relative;
		width: 150px;
		height: 150px;
	}

	.image-item.add-image {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--content-1);
		color: var(--content);
		font-size: 2rem;
		border-radius: 10px;
		cursor: pointer;
	}

	.image-item.add-image:hover {
		background-color: var(--content-2);
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 10px;
	}

	.image-actions {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: opacity 0.3s;
		border-radius: 10px;
	}

	.image-item:hover .image-actions {
		opacity: 1;
	}

	.download-button,
	.delete-button {
		background: var(--interactive-9);
		color: var(--main);
		border: none;
		padding: 0.5rem 1rem;
		margin: 0.5rem;
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.download-button:hover,
	.delete-button:hover {
		background: var(--interactive);
		transform: scale(1.05);
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		align-items: center;
	}

	.button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s, transform 0.2s;
	}

	.save-button {
		background-color: var(--interactive);
		color: var(--main);
	}

	.save-button:hover {
		background-color: var(--interactive-7);
		transform: scale(1.05);
	}

	.delete-button {
		background-color: var(--content-5);
		color: var(--main);
	}

	.delete-button:hover {
		background-color: var(--content-7);
		transform: scale(1.05);
	}

	input[type='file'] {
		display: none;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.form-group {
			width: 100%;
			padding: 0 1rem;
		}

		.button {
			width: 100%;
			text-align: center;
		}
	}
</style>
