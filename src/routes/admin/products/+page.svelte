<script lang="ts">
	import { fade } from 'svelte/transition';
	import { sizeCategoryIds, categories as categoriesStore } from '../../mockDb';
	import { baseRoute, allProductsStore, language, dictionary } from '../../stores';
	import toast from 'svelte-french-toast';
	import { doc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/rada';
	import { onMount } from 'svelte';
	import { letterToAvatarUrl } from '../../functions';
	import Table from '../components/table.svelte';
	import type { Badge, Cell, Row } from '../types/table';

	let filteredProducts: Row[] = [];
	let searchQuery = '';

	$: searchQuery, (filteredProducts = filterProducts());

	async function fetchProducts() {
		try {
			filteredProducts = filterProducts();
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	}

	onMount(() => {
		fetchProducts();
	});

	function filterProducts(): Row[] {
		return $allProductsStore
			.filter(
				(product) =>
					searchQuery === '' ||
					product.name[$language].toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.price.includes(searchQuery.toLowerCase()),
			)
			.map((product) => {
				const imageCell: Cell = {
					type: 'image',
					content:
						product.imageSources[0] ||
						letterToAvatarUrl(product.name[$language].charAt(0)),
					alt: `${$dictionary.view} ${product.name[$language]}`,
					link: `${baseRoute}/catalog/products/${product.href}`,
				};

				const nameCell: Cell = {
					type: 'string',
					content: product.name[$language],
					link: `${baseRoute}/catalog/products/${product.href}`,
				};

				const priceCell: Cell = {
					type: 'string',
					content: product.price,
					link: `${baseRoute}/catalog/products/${product.href}`,
				};

				const statusCell: Cell = {
					type: 'switch',
					content: product.status,
					callback: (newStatus: boolean) => toggleStatus(product.id, newStatus),
				};

				const fallbackCategory: Badge = {
					href: `${baseRoute}/admin/categories`,
					name: $dictionary.noCategories,
					backgroundColor: 'red',
				};
				let productCategories: Badge[] = product.categoryIds
					.filter((id) => !sizeCategoryIds.includes(id))
					.map((element) => {
						return {
							name:
								categoriesStore.find((category) => category.id === element)?.name[
									$language
								] || '...',
							href: `${baseRoute}/admin/categories/${element}`,
						} as Badge;
					});
				if (!productCategories.length) productCategories.push(fallbackCategory);
				const categoriesCell: Cell = {
					type: 'badgeArray',
					content: productCategories,
				};

				const editButtonCell: Cell = {
					type: 'link',
					content:
						'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
					alt: `${$dictionary.edit} ${$dictionary.product}`,
					link: `${baseRoute}/admin/products/${product.id}`,
				};

				return [
					imageCell,
					nameCell,
					priceCell,
					statusCell,
					categoriesCell,
					editButtonCell,
				] as Row;
			});
	}

	async function toggleStatus(productId: string, newStatus: boolean) {
		// Update the product status in the local state
		$allProductsStore = $allProductsStore.map((product) =>
			product.id === productId ? { ...product, status: newStatus } : product,
		);

		// Update the product status in the database
		try {
			const productRef = doc(db, 'products', productId);
			await updateDoc(productRef, { status: newStatus });
		} catch (error) {
			toast.error('Error updating product status');
			console.error('Error updating product status:', error);
		}
	}

	let tableHead = [
		$dictionary.image,
		$dictionary.name,
		$dictionary.price,
		$dictionary.status,
		$dictionary.categories,
		$dictionary.action,
	];
</script>

<svelte:head>
	<title>{$dictionary.admin} | {$dictionary.productList}</title>
</svelte:head>

<div in:fade class="products-page">
	<h1>{$dictionary.productList}</h1>
	<main>
		<div class="header">
			<div class="action-buttons">
				<a
					class="add-button"
					href="{baseRoute}/admin/products/new"
					aria-label={$dictionary.addProduct}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
					>
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6H5v-2h6V5h2v6h6v2h-6v6z"
						/>
					</svg>
					{$dictionary.addProduct}
				</a>
			</div>
			<input
				type="text"
				placeholder="{$dictionary.searchProducts}..."
				bind:value={searchQuery}
				class="search-bar"
			/>
		</div>
		<div in:fade class="products">
			{#if $allProductsStore.length > 0}
				{#if filteredProducts.length > 0}
					<Table head={tableHead} body={filteredProducts} />
				{:else}
					<p>{$dictionary.noProductsMatchYourSearchCriteria}</p>
				{/if}
			{:else}
				<p>{$dictionary.loadingProducts}...</p>
			{/if}
		</div>
	</main>
</div>

<style>
	.products-page {
		padding: 1rem;
		display: grid;
		align-items: center;
		justify-items: center;
		min-width: 800px;
	}

	main {
		width: 100%;
		margin: 0 auto;
		border: #00000010 solid 3px;
		border-radius: 20px;
		box-shadow: 0 0 10px #00000010;
		overflow: hidden;
		overflow: clip;
		background-color: #fff;
		padding: 2rem 2rem 1.5rem;
		display: grid;
		align-items: center;
		gap: 1rem;
	}

	h1 {
		margin-bottom: 1.5rem;
		font-size: 2.25rem;
		font-weight: 500;
		border-radius: 15px;
	}

	.header {
		display: flex;
		gap: 2rem;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.add-button {
		display: flex;
		align-items: center;
		gap: 0.75ch;
		border: solid 1px var(--interactive-5);
		background-color: var(--interactive-1);
		box-shadow: 1px 1px 5px #ff000030;
		color: var(--interactive);
		padding: 0.5rem 0.75rem;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.add-button svg {
		fill: var(--interactive);
	}

	.add-button:hover {
		filter: brightness(120%);
		transform: scale(1.02);
	}

	.search-bar {
		padding: 0.75rem 1rem;
		border: 1px solid #ddd;
		box-shadow: 1px 1px 5px var(--content-1);
		border-radius: 10px;
		transition: all 0.3s;
	}

	.search-bar:hover,
	.search-bar:focus {
		box-shadow: 1px 1px 5px var(--content-2);
		transform: scale(1.025);
	}
</style>
