<script lang="ts">
	import { sizeCategoryIds, type Category } from '../../mockDb';
	import { baseRoute, categoriesStore, language, dictionary } from '../../stores';
	import { letterToAvatarUrl } from '../../functions';
	import type { Cell, Row } from '../types/table';
	import AdminPage from '../components/adminPage.svelte';
	import DataController from '../components/dataController.svelte';

	const tableHead = [
		{
			name: $dictionary.image,
			importance: 3,
		},
		{
			name: $dictionary.name,
		},
		{
			name: $dictionary.description,
			importance: 1,
		},
		{
			name: 'HREF',
			importance: 2,
		},
		{
			name: $dictionary.action,
		},
	];

	function transformCategoriesToRows(categories: Category[]): Row[] {
		return categories.map((category) => {
			const imageCell: Cell = {
				type: 'image',
				content: category.imageSrc || letterToAvatarUrl(category.name[$language].charAt(0)),
				alt: `${$dictionary.view} ${category.name[$language]}`,
				link: `${baseRoute}/catalog/${category.href}`,
			};

			const nameCell: Cell = {
				type: 'string',
				content: category.name[$language],
				link: `${baseRoute}/catalog/${category.href}`,
			};

			const descriptionCell: Cell = {
				type: 'string',
				content: category.description ? category.description[$language] : '',
				link: `${baseRoute}/catalog/${category.href}`,
			};

			const hrefCell: Cell = {
				type: 'string',
				content: category.href,
				link: `${baseRoute}/catalog/${category.href}`,
			};

			const editButtonCell: Cell = {
				type: 'link',
				content:
					'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
				alt: `${$dictionary.edit} ${$dictionary.category}`,
				link: `${baseRoute}/admin/categories/${category.id}`,
			};

			return [imageCell, nameCell, descriptionCell, hrefCell, editButtonCell] as Row;
		});
	}
</script>

<AdminPage title={$dictionary.categoryList}>
	<DataController
		allItems={$categoriesStore.filter((category) => !sizeCategoryIds.includes(category.id))}
		itemIntoRowTransformationFunction={transformCategoriesToRows}
		{tableHead}
		searchProperties={['name', 'description']}
		addItemHref="{baseRoute}/admin/categories/new"
		controllerTexts={{
			loading: $dictionary.loadingCategories,
			add: $dictionary.addCategory,
			noMatches: $dictionary.noCategoriesMatchYourSearchCriteria,
			search: $dictionary.searchCategories,
		}}
	/>
</AdminPage>
