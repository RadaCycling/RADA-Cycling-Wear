<script lang="ts">
	import { sizeCategoryIds, categories as categoriesStore, type Product } from '../../mockDb';
	import { baseRoute, allProductsStore, language, dictionary } from '../../stores';
	import toast from 'svelte-french-toast';
	import { doc, updateDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/rada';
	import { letterToAvatarUrl } from '../../functions';
	import type { Badge, Cell, Row } from '../types/table';
	import AdminPage from '../components/adminPage.svelte';
	import DataController from '../components/dataController.svelte';

	const tableHead = [
		$dictionary.image,
		$dictionary.name,
		$dictionary.price,
		$dictionary.status,
		$dictionary.categories,
		$dictionary.action,
	];

	function transformProductsToRows(products: Product[]): Row[] {
		return products.map((product) => {
			const imageCell: Cell = {
				type: 'image',
				content:
					product.imageSources[0] || letterToAvatarUrl(product.name[$language].charAt(0)),
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
</script>

<AdminPage title={$dictionary.productList}>
	<DataController
		allItems={$allProductsStore}
		itemIntoRowTransformationFunction={transformProductsToRows}
		{tableHead}
		searchProperties={['name', 'price']}
		addItemHref="{baseRoute}/admin/products/new"
		controllerTexts={{
			loading: $dictionary.loadingProducts,
			add: $dictionary.addProduct,
			noMatches: $dictionary.noProductsMatchYourSearchCriteria,
			search: $dictionary.searchProducts,
		}}
	/>
</AdminPage>
