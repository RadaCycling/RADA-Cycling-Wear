<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
	import { page } from '$app/stores';
	import { db } from '$lib/firebase/rada';
	import { baseRoute } from '../../../stores';
	import toast from 'svelte-french-toast';
	import { autoResizeTextarea } from '../../../functions';

	let product: any = {};
	let id: string = '';
	let categoryIds: string = '';
	let imageSources: string = '';
	let versionIds: string = '';
	let detailsString: string = '';
	let validDetails: boolean = true;

	function handleCategoryIdsInput(e: Event) {
		const target = e.target as HTMLInputElement;
		product.categoryIds = target.value.split(',').map((id) => parseInt(id.trim()));
	}

	function handleImageSourcesInput(e: Event) {
		const target = e.target as HTMLInputElement;
		product.imageSources = target.value.split(',').map((src) => src.trim());
	}

	function handleVersionsIdsInput(e: Event) {
		const target = e.target as HTMLInputElement;
		product.versionIds = target.value.split(',').map((src) => src.trim());
	}

	function handleDetailsInput(e: Event) {
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

	onMount(async () => {
		id = $page.params.id;
		const docRef = doc(db, 'products', id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			product = docSnap.data();

			imageSources = product.imageSources ? product.imageSources.join(', ') : '';
			categoryIds = product.categoryIds ? product.categoryIds.join(', ') : '';
			versionIds = product.versionIds ? product.versionIds.join(', ') : '';
			detailsString = JSON.stringify(product.details, null, 2);
		} else {
			console.log('No such document!');
		}
	});

	async function saveProduct() {
		if (!validDetails) {
			toast.error('Invalid details JSON format');
			return;
		}
		const docRef = doc(db, 'products', id);
		await updateDoc(docRef, product);
		toast.success('Product saved successfully!');
	}

	async function deleteProduct() {
		const docRef = doc(db, 'products', id);
		await deleteDoc(docRef);
		toast.success('Product deleted successfully!');

		// Redirect to another page after deletion
		window.location.href = baseRoute + '/admin/products';
	}
</script>

<head>
	<title>Admin | Edit Product - {$page.params.id}</title>
</head>

{#if product.name}
	<main class="edit-product-page">
		<h1>Edit Product</h1>
		<div class="form-group">
			<label>
				Name (EN):
				<input type="text" bind:value={product.name.en} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Name (ES):
				<input type="text" bind:value={product.name.es} />
			</label>
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
				<input type="text" bind:value={product.price} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Old Price:
				<input type="text" bind:value={product.oldPrice} />
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
				Image Sources (comma separated):
				<input type="text" bind:value={imageSources} on:input={handleImageSourcesInput} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Image Hover Source:
				<input type="text" bind:value={product.imageHoverSource} />
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
				<input type="text" bind:value={product.href} />
			</label>
		</div>
		<div class="form-group">
			<label>
				Version IDs (comma separated):
				<input type="text" bind:value={versionIds} on:input={handleVersionsIdsInput} />
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
			<button class="button save-button" on:click={saveProduct}>Save</button>
			<button class="button delete-button" on:click={deleteProduct}>Delete</button>
		</div>
	</main>
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
	}

	h1 {
		margin-bottom: 2rem;
		font-size: 2.5rem;
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
	textarea {
		margin-top: 0.5rem;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid var(--content-5);
		border-radius: 5px;
		background-color: var(--main-8);
		color: var(--content);
	}

	textarea.invalid {
		border-color: red;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
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

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.form-group {
			width: 100%;
			padding: 0 1rem;
		}

		.button-group {
			flex-direction: column;
			width: 100%;
		}

		.button {
			width: 100%;
			text-align: center;
		}
	}
</style>
