<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
	import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
	import { page } from '$app/stores';
	import { db, storage } from '$lib/firebase/rada';
	import {
		allProductsStore,
		baseImageRoute,
		baseRoute,
		dataReady,
		dictionary,
		language,
	} from '../../../stores';
	import toast from 'svelte-french-toast';
	import { randomizeFileName, repositionElement } from '../../../functions';
	import {
		denormalizeCategories,
		sizeCategoryIds,
		sizeOptions,
		type Category,
		type Product,
		type UnitsInStock,
		categories as allCategoriesStore,
		findProductsByIds,
		type TableEntry,
	} from '../../../mockDb';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import Texteditor from '../../components/texteditor.svelte';
	import ArrayInput from '../../components/arrayInput.svelte';
	import Image from '../../components/image.svelte';
	import Specification from '../../components/specification.svelte';
	import { flip } from 'svelte/animate';
	import Dialog from '../../components/dialog.svelte';

	let form: HTMLFormElement;

	let product: Product | undefined;
	const newProductParameter = 'new';
	let isNewProduct = false;
	const emptyDetail: TableEntry = {
		id: '',
		status: true,
		label: { en: '', es: '' },
		value: { en: '', es: '' },
	};
	const emptyProduct: Product = {
		id: '',
		unitsInStock: sizeOptions.map((option) => {
			return { id: option.id, name: option.name, units: 1 } as UnitsInStock;
		}),
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
		categoryIds: sizeCategoryIds,
		versionsIds: [],
		details: [],
	};

	let id: string = '';
	let categories: Category[] = [];
	$: product?.categoryIds, getCategories();
	let versions: Product[] = [];
	$: product?.versionsIds, getVersions();
	let isSingleSize: boolean;
	let singleSizeChangerMemory: UnitsInStock[] | number;
	let validDetails: boolean = true;
	let imageFiles: File[] = [];

	function handleStockInput(e: Event, size?: UnitsInStock) {
		if (!product) return;

		let noStock: boolean = true;
		let newValue: string | number = (e.target as HTMLInputElement).value;

		if (/^[+-]?\d+$/.test(newValue)) {
			newValue = Number(newValue);
			if (newValue < 0) {
				newValue = 0;
				(e.target as HTMLInputElement).value = '0';
			}
			if (typeof product.unitsInStock === 'object') {
				const match = product.unitsInStock.find((option) => option === size);
				if (match) {
					match.units = newValue;
				}

				for (let index = 0; index < product.unitsInStock.length; index++) {
					const element = product.unitsInStock[index];

					if (element.units > 0) {
						noStock = false;
					}
				}
			} else {
				product.unitsInStock = newValue;
				noStock = product.unitsInStock < 1;
			}
		} else {
			noStock = false;
		}

		if (noStock && product.status) {
			product.status = false;
			toast('Product status was deactivated because there are no units in stock.');
		}
	}

	function handleStockInputBlur(e: Event, size?: UnitsInStock) {
		if (!product) return;

		const newValue: string | number = (e.target as HTMLInputElement).value;
		if (!/^[+-]?\d+$/.test(newValue)) {
			if (typeof product.unitsInStock === 'object') {
				const match = product.unitsInStock.find((option) => option === size);
				if (match) {
					(e.target as HTMLInputElement).value = match.units.toString();
				}
			} else {
				(e.target as HTMLInputElement).value = product.unitsInStock.toString();
			}
		}
	}

	function handleSingleSizeChange() {
		if (!product) return;
		let localMemory;
		if (singleSizeChangerMemory) {
			localMemory = singleSizeChangerMemory;
		} else if (isSingleSize) {
			localMemory = 1;
		} else {
			localMemory = emptyProduct.unitsInStock;
		}

		if (isSingleSize) {
			singleSizeChangerMemory = product.unitsInStock;
			product.unitsInStock = localMemory;

			// Remove elements that are in sizeCategoryIds
			product.categoryIds = product.categoryIds.filter((id) => !sizeCategoryIds.includes(id));
		} else {
			singleSizeChangerMemory = product.unitsInStock;
			product.unitsInStock = localMemory;

			// Add only missing elements from sizeCategoryIds
			product.categoryIds = [
				...product.categoryIds,
				...sizeCategoryIds.filter((id) => !product?.categoryIds.includes(id)),
			];
		}
	}

	function checkHREF() {
		if (!product) return;

		product.href = product.href.replace(/[^a-zA-Z0-9-]/g, '');
		if (product.href === '') {
			product.href = product.name.en
				.toLowerCase()
				.replaceAll(' ', '-')
				.replace(/[^a-zA-Z0-9-]/g, '');
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

	function getCategories() {
		if (!product) return;

		let visibleCategories = product.categoryIds.filter((id) => !sizeCategoryIds.includes(id));
		categories = denormalizeCategories(visibleCategories);
	}

	function syncCategories() {
		if (!product) return;

		product.categoryIds = categories.map((item) => item.id);

		// Maintain size's categories
		if (!isSingleSize) {
			product.categoryIds = [
				...product.categoryIds,
				...sizeCategoryIds.filter((id) => !product?.categoryIds.includes(id)),
			];
		}
	}

	function getVersions() {
		if (!product || !product.versionsIds) return;

		let visibleVersions = product.versionsIds.filter((id) => product?.id !== id);
		versions = findProductsByIds(visibleVersions, $allProductsStore);
	}

	function syncVersions() {
		if (!product) return;

		product.versionsIds = versions.map((item) => item.id);

		// Maintain product's id
		if (versions.length > 0) {
			product.versionsIds.push(product.id);
		}
	}

	async function setImageUrlsFromStorage(type: 'main' | 'hover' | 'all' = 'all') {
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
		if (target.files && product) {
			imageFiles = Array.from(target.files);
			for (let file of imageFiles) {
				file = randomizeFileName(file);

				imagesAddedLocally.push(file);

				product.dbImageSources = [...product.dbImageSources, file.name];
				product.imageSources = [...product.imageSources, URL.createObjectURL(file)];
			}
		}

		// Reset Input Element
		target.value = '';
	}

	async function handleImageDelete(imageSource: string, storageURL: string) {
		if (!product || !imageSource) return;

		imagesDeletedLocally.push(imageSource);

		// Only delete one instance of the imageSource
		const index = product!.dbImageSources.indexOf(imageSource);
		if (index !== -1) {
			product!.dbImageSources.splice(index, 1);
		}
		product!.imageSources = product!.imageSources.filter((src) => src !== storageURL);
	}

	async function handleHoverImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			imageFiles = Array.from(target.files);
			if (imageFiles.length > 1) {
				toast('Warning: Only the one file will be uploaded as the hover image.');
			}
			for (let file of imageFiles) {
				if (product) {
					file = randomizeFileName(file);

					imagesAddedLocally.push(file);

					product.dbImageHoverSource = file.name;
					product.imageHoverSource = URL.createObjectURL(file);
				}
			}
		}

		// Reset Input Element
		target.value = '';
	}

	async function handleHoverImageDelete(imageSource: string) {
		if (!product || !imageSource) return;

		imagesDeletedLocally.push(imageSource);

		product.dbImageHoverSource = null;
		product.imageHoverSource = '';
	}

	const imagesAddedLocally: File[] = [];
	async function addImageToStorage(imageFile: File) {
		const imageRef = ref(storage, `products/${imageFile.name}`);
		await uploadBytes(imageRef, imageFile);
	}

	const imagesDeletedLocally: string[] = [];
	async function deleteImageFromStorage(imageSource: string) {
		const imageRef = ref(storage, `products/${imageSource}`);
		await deleteObject(imageRef);
	}

	function syncImageLists(): void {
		const deleteCount: Record<string, number> = {};
		const addCount: Record<string, number> = {};

		// Count occurrences in imagesDeletedLocally
		for (const name of imagesDeletedLocally) {
			deleteCount[name] = (deleteCount[name] || 0) + 1;
		}

		// Count occurrences in imagesAddedLocally (store original File objects)
		const originalFiles: Record<string, File> = {};
		for (const file of imagesAddedLocally) {
			addCount[file.name] = (addCount[file.name] || 0) + 1;
			if (!originalFiles[file.name]) {
				originalFiles[file.name] = file;
			}
		}

		// Adjust counts: Remove common elements
		for (const name in deleteCount) {
			if (addCount[name]) {
				const minCount = Math.min(deleteCount[name], addCount[name]);
				deleteCount[name] -= minCount;
				addCount[name] -= minCount;
			}
		}

		// Reconstruct imagesDeletedLocally without duplicates
		imagesDeletedLocally.length = 0;
		for (const name in deleteCount) {
			if (deleteCount[name] > 0) {
				for (let i = 0; i < deleteCount[name]; i++) {
					imagesDeletedLocally.push(name);
				}
			}
		}

		// Reconstruct imagesAddedLocally using original File objects
		imagesAddedLocally.length = 0;
		for (const name in addCount) {
			if (addCount[name] > 0) {
				imagesAddedLocally.push(originalFiles[name]);
			}
		}
	}

	onMount(async () => {
		id = $page.params.id;
		isNewProduct = id === newProductParameter;
		product = isNewProduct
			? emptyProduct
			: structuredClone($allProductsStore.find((p) => p.id === id));

		if (product) {
			isSingleSize = typeof product?.unitsInStock === 'number';
			getCategories();
			getVersions();
			product.details = product.details.map((el) => {
				if (!el.id) el.id = crypto.randomUUID();
				return el;
			});
			await setImageUrlsFromStorage();
		} else if (!isNewProduct) {
			toast.error('Invalid product ID');
			goto(baseRoute + '/admin/products');
			return;
		}
	});

	async function saveProduct() {
		// Validate the product
		if (!product) {
			toast.error('Product not found');
			return;
		} else if (!product.name.en || !product.name.es || !product.price || !product.href) {
			toast.error('Please fill in all required fields.');
			return;
		} else if (product.price === '$0.00') {
			toast.error('$0.00 is not a valid price.');
			return;
		} else if (!validDetails) {
			toast.error('Invalid details JSON format');
			return;
		}
		$dataReady = false;

		// Update Images
		syncImageLists();
		for (let i = 0; i < imagesDeletedLocally.length; i++) {
			const element = imagesDeletedLocally[i];
			await deleteImageFromStorage(element);
		}
		for (let i = 0; i < imagesAddedLocally.length; i++) {
			const element = imagesAddedLocally[i];
			await addImageToStorage(element);
		}
		await setImageUrlsFromStorage();

		// Save the product
		if (id === newProductParameter) {
			// Update Product in Database
			const newDocRef = doc(collection(db, 'products'));
			product.id = newDocRef.id;
			await setDoc(newDocRef, product);

			// Update Product Locally
			allProductsStore.update((products) => {
				if (!product) return products;
				return [...products, product];
			});

			toast.success('New product created successfully!');
		} else {
			// Update Product in Database
			const docRef = doc(db, 'products', id);
			await updateDoc(docRef, product);

			// Update Product Locally
			allProductsStore.update((products) => {
				const index = products.findIndex((p) => p.id === id);
				if (index !== -1 && product) {
					products[index] = product;
				}
				return products;
			});

			toast.success('Product saved successfully!');
		}

		$dataReady = true;
		goto(baseRoute + '/admin/products');
	}

	let dialogElement: HTMLDialogElement;
	async function deleteProduct() {
		// Delete Product from Firestore
		try {
			const docRef = doc(db, 'products', id);
			await deleteDoc(docRef);

			allProductsStore.update((products) => products.filter((p) => p.id !== id));

			toast.success('Product deleted successfully!');
		} catch (error) {
			toast.error('Product could not be deleted.');
		}

		// Delete Product's Images from Storage
		try {
			if (product) {
				for (let index = 0; index < product.dbImageSources.length; index++) {
					const element = product.dbImageSources[index];
					await deleteImageFromStorage(element);
				}
				if (product.dbImageHoverSource) {
					await deleteImageFromStorage(product.dbImageHoverSource);
				}
			}
		} catch (error) {
			toast('Warning: Product images could not be deleted from storage.');
		}

		goto(baseRoute + '/admin/products');
	}
</script>

<svelte:head>
	<title
		>Admin | {isNewProduct ? 'Create New Product' : 'Edit Product'} - {product?.name[
			$language
		] || 'Unnamed product'}</title
	>
</svelte:head>
{#if product}
	<form in:fade bind:this={form} class="edit-product-page">
		<header>
			<a href="{baseRoute}/admin/products">
				<ion-icon name="close" />
			</a>
			<h1>{isNewProduct ? 'Create New Product' : 'Edit Product'}</h1>
			<p>{product.name[$language] || 'Unnamed product'}</p>
		</header>

		<!-- GENERAL INFORMATION -->
		<section>
			<h2>General Information</h2>
			<div class="section-content">
				<p>Provide basic details about the product.</p>
				<div class="form-group">
					<label class="form-group-label" for="name-en"
						><img src="{baseImageRoute}/usFlag.webp" alt="English" lang="en" />
						<span>Name (English):</span></label
					>
					<input
						id="name-en"
						type="text"
						required
						bind:value={product.name.en}
						on:change={checkHREF}
					/>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="name-es"
						><img src="{baseImageRoute}/spainFlag.webp" alt="Español" lang="es" />
						<span>Name (Spanish):</span></label
					>
					<input id="name-es" type="text" required bind:value={product.name.es} />
				</div>
				<div class="form-group">
					<label class="form-group-label" for="description-en"
						><img src="{baseImageRoute}/usFlag.webp" alt="English" lang="en" />
						<span>Description (English):</span></label
					>
					<Texteditor bind:content={product.description.en} />
				</div>
				<div class="form-group">
					<label class="form-group-label" for="description-es"
						><img src="{baseImageRoute}/spainFlag.webp" alt="Español" lang="es" />
						<span>Description (Spanish):</span></label
					>
					<Texteditor bind:content={product.description.es} />
				</div>
				<p>
					Enter a short, <b>unique</b> link for this product.
				</p>
				<div class="form-group">
					<label class="form-group-label" for="href">Product URL (HREF):</label>
					<input
						id="href"
						type="text"
						required
						bind:value={product.href}
						on:change={checkHREF}
					/>
				</div>
			</div>
		</section>

		<!-- PRICING & STOCK -->
		<section>
			<h2>Pricing & Stock</h2>
			<div class="section-content">
				<p>Set the price and stock details for the product.</p>
				<div class="form-group">
					<label class="form-group-label" for="price">Price:</label>
					<input
						id="price"
						type="text"
						required
						bind:value={product.price}
						on:input={handlePriceInput}
						on:blur={checkPriceInput}
					/>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="old-price">Old Price (optional):</label>
					<input
						id="old-price"
						type="text"
						bind:value={product.oldPrice}
						on:input={handlePriceInput}
						on:blur={checkPriceInput}
					/>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="status">Single Size</label>
					<label class="switch">
						<input
							id="isSingleSize"
							type="checkbox"
							bind:checked={isSingleSize}
							on:change={handleSingleSizeChange}
						/>
						<span class="slider" />
					</label>
					<span
						>"{product.name['en'] || '...'}" has
						<b>{isSingleSize ? 'only one size' : 'multiple sizes'}</b>.</span
					>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="units-in-stock">Units in Stock:</label>
					<div class="size-stock">
						{#if typeof product.unitsInStock === 'object'}
							{#each product.unitsInStock as size}
								<div class="size-stock-group">
									<label class="size-stock-label" for="units-in-stock-{size.id}"
										>{$dictionary.size} {size.name}:</label
									>
									<input
										id="units-in-stock-{size.id}"
										type="number"
										required
										value={size.units}
										on:input={(e) => handleStockInput(e, size)}
										on:blur={(e) => handleStockInputBlur(e, size)}
									/>
								</div>
							{/each}
						{:else}
							<input
								id="units-in-stock"
								type="number"
								required
								value={product.unitsInStock}
								on:input={(e) => handleStockInput(e)}
								on:blur={(e) => handleStockInputBlur(e)}
							/>
						{/if}
					</div>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="status"> Product Status </label>
					<label class="switch">
						<input id="status" type="checkbox" bind:checked={product.status} />
						<span class="slider" />
					</label>
					<span
						>"{product.name['en'] || '...'}" is
						<b>{product.status ? 'visible' : 'hidden'}</b>.</span
					>
				</div>
			</div>
		</section>

		<!-- CATEGORIES & VERSIONS -->
		<section>
			<h2>Categories & Versions</h2>
			<div class="section-content">
				<p>Specify the categories and versions for this product.</p>
				<div class="form-group">
					<label class="form-group-label" for="main-version"> Main Version </label>
					<label class="switch">
						<input
							id="main-version"
							type="checkbox"
							bind:checked={product.mainVersion}
						/>
						<span class="slider" />
					</label>
					<span
						>"{product.name['en'] || '...'}"
						<b>{product.mainVersion ? 'is' : 'is not'}</b> the main version.</span
					>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="new-category">Categories:</label>
					<ArrayInput
						bind:selectedElements={categories}
						array={allCategoriesStore}
						impossibleOptionsIds={sizeCategoryIds}
						placeholder="Add a new category..."
						on:change={syncCategories}
					/>
				</div>
				<div class="form-group">
					<label class="form-group-label" for="version-ids">Versions (optional):</label>
					<ArrayInput
						bind:selectedElements={versions}
						array={$allProductsStore}
						impossibleOptionsIds={[product.id]}
						placeholder="Add a new version..."
						on:change={syncVersions}
					/>
				</div>
			</div>
		</section>

		<!-- IMAGES -->
		<section>
			<h2>Images</h2>
			<div class="section-content">
				<p>Upload product images and set an optional hover image.</p>
				<div class="form-group">
					<h3 class="form-group-label">Main Images</h3>
					<div class="image-gallery">
						<label class="image-item add-image">
							<ion-icon name="add" />
							<input type="file" multiple on:change={handleImageUpload} />
						</label>
						{#each product.imageSources as url, index (url)}
							<div animate:flip={{ duration: 500 }}>
								<Image
									image={{
										source: url,
										alt: product.dbImageSources[index],
										position:
											product.imageSources.length > 1 ? index : undefined,
									}}
									on:delete={() => {
										if (product) {
											handleImageDelete(product.dbImageSources[index], url);
										}
									}}
									on:reposition={(event) => {
										if (product) {
											product.dbImageSources = repositionElement(
												product.dbImageSources,
												product.dbImageSources[index],
												event.detail,
											);
											product.imageSources = repositionElement(
												product?.imageSources,
												url,
												event.detail,
											);
										}
									}}
								/>
							</div>
						{/each}
					</div>
				</div>
				<div class="form-group">
					<h3 class="form-group-label">Hover Image</h3>
					<div class="image-gallery">
						{#if product.imageHoverSource}
							<Image
								image={{
									source: product.imageHoverSource,
									alt: product.dbImageHoverSource || '',
								}}
								on:delete={() => {
									if (product?.dbImageHoverSource) {
										handleHoverImageDelete(product.dbImageHoverSource);
									}
								}}
							/>
						{:else}
							<label class="image-item add-image">
								<ion-icon name="add" />
								<input type="file" multiple on:change={handleHoverImageUpload} />
							</label>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- ADDITIONAL DETAILS -->
		<section>
			<h2>Additional Details</h2>
			<div class="section-content">
				<p>Specify details about the product.</p>
				<div class="details">
					{#each product.details as item, index (item.id)}
						<div animate:flip={{ duration: 500 }}>
							<Specification
								content={item}
								specificationIndex={index}
								specificationsAmount={product.details.length}
								on:delete={() => {
									if (product) {
										product.details = product.details.filter(
											(detail) => detail !== item,
										);
									}
								}}
								on:moveUp={() => {
									if (product) {
										product.details = repositionElement(
											product.details,
											item,
											index - 1,
										);
									}
								}}
								on:moveDown={() => {
									if (product) {
										product.details = repositionElement(
											product.details,
											item,
											index + 1,
										);
									}
								}}
							/>
						</div>
					{/each}
					<button
						class="newSpecification"
						type="button"
						on:click={() => {
							if (product) {
								const newDetail = {
									...structuredClone(emptyDetail),
									id: crypto.randomUUID(),
								};
								product.details = [...product.details, newDetail];
							}
						}}
					>
						<ion-icon name="add" /> {$dictionary.addASpecification}</button
					>
				</div>
			</div>
		</section>

		<!-- ACTIONS -->
		<section class="button-group">
			<button type="submit" class="button save-button" on:click={saveProduct}>
				<ion-icon name="checkmark-circle" />
				<span>
					{isNewProduct ? 'Create Product' : 'Save Changes'}
				</span>
			</button>
			{#if !isNewProduct}
				<button
					type="button"
					class="button delete-button"
					on:click={() => dialogElement.showModal()}
				>
					<ion-icon name="trash" />
					<span>Delete Product</span>
				</button>

				<Dialog
					bind:dialogElement
					parameters={{
						callback: deleteProduct,
						title: `Delete ${product.name[$language]}?`,
						text: `Are you sure that you want to delete the product called ${product.name[$language]}?`,
						actionButtonText: 'Confirm',
					}}
				/>
			{/if}
		</section>
	</form>
{/if}

<style>
	.edit-product-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-color: #ffffffaa;
		border-radius: 20px;
		color: var(--content);
		width: 100%;
		max-width: 1500px;
		margin: auto;
	}

	header {
		max-width: 600px;
		width: 100%;
		position: relative;

		display: grid;
		justify-items: center;
		align-items: center;
		margin-top: -0.5rem;
		margin-bottom: 2rem;
	}

	header a {
		position: absolute;
		right: 0;
		top: -1rem;

		display: flex;
		align-items: center;
		text-decoration: none;
		color: var(--content-5);
		font-size: 1.2rem;
		border-radius: 50%;
		padding: 0.25rem;

		transition: all 0.3s;
	}

	header a:hover {
		color: var(--content-8);
		background-color: #ffffff;
		box-shadow: 0 0 10px #fff;
		transform: scale(1.1);
	}

	header p {
		color: var(--content-5);
		font-weight: bold;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: normal;
	}

	h2 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 500;
	}

	section {
		width: 100%;
		max-width: 700px;
		margin-bottom: 2rem;

		border: #00000010 solid 3px;
		border-radius: 20px;
		box-shadow: 0 0 10px #00000010;
		background-color: #fff;
		padding: 2rem 2rem 1.5rem;
	}

	.section-content {
		padding-left: 1.5rem;
		padding-bottom: 0.5rem;
		border-left: 2px solid var(--content-2);
	}

	section p {
		margin-bottom: 1.25rem;
		font-size: 1em;
		color: var(--content-7);
	}

	.form-group {
		position: relative;

		margin-bottom: 1.5rem;
		width: 100%;
		max-width: 600px;
		border: 1px solid var(--content-5);
		border-radius: 5px;
	}

	.form-group-label {
		position: absolute;
		top: 0;
		transform: translateY(-60%);
		left: 0.5rem;

		display: flex;
		align-items: center;
		column-gap: 0.75ch;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--content-5);
		background-color: #ffffff;
		padding: 0.25em 0.5em;
	}

	.form-group-label img {
		height: 0.8em;
		transform: translateY(0.5px);
		width: auto;
		border-radius: 3px;
	}

	input[type='text'],
	input[type='number'],
	.size-stock-group {
		width: 100%;
		font-size: 1.1rem;
		padding: 1rem 1rem 0.75rem;
		color: var(--content);
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 34px;
		height: 20px;
		transition: all 0.3s;
		margin: 1rem;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.switch:hover {
		filter: brightness(120%);
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 14px;
		width: 14px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: #4caf50;
	}

	input:checked + .slider:before {
		transform: translateX(14px);
	}

	.size-stock {
		display: grid;
	}

	.size-stock-group {
		display: grid;
		grid-template-columns: auto 1fr;
		justify-content: flex-start;
		align-items: center;
		padding: 0.5rem 1rem 0.5rem;
	}

	.size-stock-group:not(:last-child) {
		border-bottom: 1px solid var(--content-2);
	}

	.size-stock-label {
		margin-top: 2.8px;
	}

	.image-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1.5rem 1rem 0;
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

	.details {
		display: grid;
		row-gap: 1.5rem;
	}

	.newSpecification {
		display: flex;
		align-items: center;
		column-gap: 1ch;

		background-color: var(--main-5);
		box-shadow: 5px 5px 10px #00000030;
		padding: 1.5rem 1rem;
		border-radius: 15px;
	}

	.newSpecification ion-icon {
		color: green;
	}

	.newSpecification:hover,
	.newSpecification:focus-visible {
		background-color: #00000010;
	}

	.button-group {
		display: grid;
		margin-top: 1rem;
		row-gap: 1.5rem;
		padding: 0;
		background-color: transparent;
		box-shadow: none;
		border: none;
	}

	.button {
		display: flex;
		align-items: center;
		column-gap: 1ch;
		width: 100%;

		background-color: white;
		box-shadow: 0 0 10px #00000030;
		padding: 1.25rem 1rem;
		border-radius: 15px;

		font-size: 1.2rem;
		font-weight: 500;

		transition: all 0.2s ease-out;
	}

	.button:hover {
		box-shadow: 0 0 15px #00000050;
		background-color: var(--interactive);
		color: var(--main);
	}

	.button ion-icon {
		font-size: 1.15em;
	}

	.save-button {
		color: green;
	}

	.delete-button {
		color: rgb(196, 0, 0);
	}

	.save-button:hover {
		background-color: green;
	}

	.delete-button:hover {
		background-color: rgb(196, 0, 0);
	}

	input[type='file'] {
		display: none;
	}
</style>
