<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import {
		findCategoryByHref,
		getCategoryIdsFromHrefs,
		type Category,
		type Product as ProductType,
		findProductsByCategoryIds,
		getCategoryNamesFromIds,
		getCategoryHrefsFromIds,
		genderCategoryIds,
		genderOptions as genderGuide,
		sizeCategoryIds,
		sizeOptions as sizeGuide,
	} from '../../mockDb';
	import { baseImageRoute, baseRoute, dictionary, language, productsStore } from '../../stores';
	import Product from '../../components/product.svelte';
	import Filter from '../../components/filter.svelte';
	import { goto } from '$app/navigation';

	let parameters: string[];

	let sizeOptions = [{ id: -1, name: $dictionary.size }, ...sizeGuide];
	let genderOptions = [{ id: -1, name: $dictionary.gender }, ...genderGuide];

	let mainCategory: Category | undefined;
	let categoryIds: number[];
	let categoryNames: string[];

	let matchingProducts: ProductType[];

	function setup() {
		parameters = $page.params.category.split('/').filter((element) => element !== '');

		mainCategory = findCategoryByHref(parameters[0]);

		categoryIds = getCategoryIdsFromHrefs(parameters);

		categoryNames = getCategoryNamesFromIds(categoryIds);

		matchingProducts = findProductsByCategoryIds(categoryIds, $productsStore);

		// Reset selected indices
		selectedSizeIndex = 0;
		selectedGenderIndex = 0;

		// Detect active size filter
		const activeSizeId = categoryIds.find((id) => sizeCategoryIds.includes(id));
		if (activeSizeId !== undefined) {
			// Find the index of the option with the active ID
			const activeSizeIndex = sizeOptions.findIndex((option) => option.id === activeSizeId);
			if (activeSizeIndex !== -1) {
				selectedSizeIndex = activeSizeIndex;
			}
		}

		// Detect active gender filter
		const activeGenderId = categoryIds.find((id) => genderCategoryIds.includes(id));
		if (activeGenderId !== undefined) {
			// Find the index of the option with the active ID
			const activeGenderIndex = genderOptions.findIndex(
				(option) => option.id === activeGenderId,
			);
			if (activeGenderIndex !== -1) {
				selectedGenderIndex = activeGenderIndex;
			}
		}

		sortByPrice();
	}

	$: $page.params.category, setup();

	// FILTER SECTION
	let selectedSizeIndex = 0;
	let selectedGenderIndex = 0;

	let selectedSortIndex = 0;
	$: selectedSortIndex, sortByPrice();
	const sortOptions = [
		{ id: -1, name: $dictionary.sortBy },
		{ id: 1, name: `${$dictionary.price} ($-$$)` },
		{ id: 2, name: `${$dictionary.price} ($$-$)` },
	];

	function filterBySize() {
		// Remove any existing size category from 'categoryIds'
		categoryIds = categoryIds.filter((id) => !sizeCategoryIds.includes(id));

		// If a size is selected (not the 'Size' option with id -1), add the selected size category
		if (sizeOptions[selectedSizeIndex].id !== -1) {
			categoryIds.push(sizeOptions[selectedSizeIndex].id);
		}

		updateCategoryHref();
	}

	function filterByGender() {
		// Remove any existing gender category from 'categoryIds'
		categoryIds = categoryIds.filter((id) => !genderCategoryIds.includes(id));

		// If a gender is selected (not the 'Gender' option with id -1), add the selected gender category
		if (genderOptions[selectedGenderIndex].id !== -1) {
			categoryIds.push(genderOptions[selectedGenderIndex].id);
		}

		updateCategoryHref();
	}

	function updateCategoryHref() {
		// Get hrefs from the updated 'categoryIds' and join them into a single string
		const hrefs = getCategoryHrefsFromIds(categoryIds).filter((href) => href !== ''); // Filter out any undefined or empty hrefs

		const newHref = hrefs.join('/');
		if (newHref !== $page.params.category) {
			goto(`${baseRoute}/catalog/${newHref}`);
		}
	}

	function sortByPrice() {
		matchingProducts.sort((a, b) => {
			// Remove currency symbols and convert price strings to numbers
			const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ''));
			const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ''));

			// Ascending order
			if (selectedSortIndex === 1) {
				return priceA - priceB;
			}
			// Descending order
			else if (selectedSortIndex === 2) {
				return priceB - priceA;
			}
			// No sorting or unrecognized index
			return 0;
		});

		// Reassign the array for Svelte to detect changes.
		matchingProducts = matchingProducts.slice();
	}

	function clearFilters() {
		if (!mainCategory?.sizeAgnostic) {
			selectedSizeIndex = 0;
		}
		if (mainCategory?.genderSpecific) {
			selectedGenderIndex = 0;
		}
		selectedSortIndex = 0;

		filterByGender();
		filterBySize();
		sortByPrice();
	}
</script>

{#key parameters}
	<main in:fade>
		<header>
			<picture>
				{#if mainCategory?.smallImageSrc}
					<source srcset={mainCategory?.smallImageSrc} media="(max-width: 650px)" />
				{/if}
				<img src={mainCategory?.imageSrc} alt={mainCategory?.imageAlt[$language]} />
			</picture>
			<h1>{mainCategory?.name[$language]}</h1>
		</header>

		<!-- {#if mainCategory?.description}
			<section class="description">
				<p>{mainCategory.description[$language]}</p>
			</section>
		{/if} -->

		<section class="filters">
			{#if mainCategory?.genderSpecific}
				<Filter
					on:change={filterByGender}
					options={genderOptions}
					bind:optionSelectedIndex={selectedGenderIndex}
				/>
			{/if}
			{#if !mainCategory?.sizeAgnostic}
				<Filter
					on:change={filterBySize}
					options={sizeOptions}
					bind:optionSelectedIndex={selectedSizeIndex}
				/>
			{/if}
			<Filter
				on:change={sortByPrice}
				options={sortOptions}
				bind:optionSelectedIndex={selectedSortIndex}
			/>

			<button class="clearFilters" on:click={clearFilters}>
				{$dictionary.clearAllFilters}
				<ion-icon name="close" />
			</button>
		</section>

		{#if matchingProducts.length > 0}
			{#key matchingProducts}
				<section class="products" in:fade>
					{#each matchingProducts as item}
						<Product product={item} />
					{/each}
				</section>
			{/key}
		{:else}
			<section class="noProducts">
				<ion-icon name="search" />
				<p>
					{$dictionary.thereAreNoProducts}
				</p>
			</section>
		{/if}
	</main>
{/key}

<svelte:head>
	<title>{$dictionary.catalog} | {categoryNames.join(' - ')}</title>
	{#if mainCategory?.description}
		<meta name="description" content={mainCategory.description[$language]} />
	{/if}
</svelte:head>

<style>
	main {
		display: grid;
		place-items: center;
		font-size: clamp(1rem, 3vw, 1.25rem);
		margin-bottom: clamp(5rem, 15vw, 7rem);
	}

	header {
		position: relative;
		text-align: center;
		width: 100%;
		height: calc(100vh - 20rem);
		height: calc(100svh - 20rem);
		min-height: 22rem;
		max-height: clamp(40rem, 5vw, 80rem);
		box-shadow: 0 10px 15px -2px var(--content-2), 0 5px 10px -4px var(--content-1);
		overflow: hidden;
	}

	header img {
		max-width: revert;
		width: 100%;
		object-position: center 20%;
		height: 100%;

		object-fit: cover;
	}

	header h1 {
		text-transform: uppercase;
		font-size: 3em;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); /* Improves legibility */

		position: absolute;
		top: 50%;
		left: 2vw;
		transform: translate(0, -50%);

		width: 50%;
	}

	/* .description {
		font-size: 1em;
		font-weight: 600;
		text-align: center;
		line-height: 1.4;

		padding-bottom: 4rem;
		border-bottom: solid 1px var(--content-5);
	} */

	@media (max-width: 650px) {
		header h1 {
			font-size: 2.5em;
			width: 90%;
			left: 50%;
			transform: translate(-50%);
		}

		header img {
			object-position: center 10%;
		}
	}

	section {
		margin: 2rem clamp(1rem, 6vw, 5rem);

		display: grid;
		place-content: center;
	}

	.products {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		/* grid-template-columns: repeat(2, 1fr);  */
		justify-content: center;
		gap: 3em 2em;

		width: fit-content;
	}

	@media (min-width: 1000px) {
		.products {
			grid-template-columns: repeat(3, 1fr);
			gap: 3em 2em;
		}
	}

	.noProducts {
		display: grid;
		place-items: center;
	}

	.noProducts p {
		line-height: 1.4;
		font-weight: normal;
		text-align: center;
	}

	.noProducts ion-icon {
		font-size: 3rem;
		color: var(--interactive);
		margin: 0 auto 2rem;
		animation: searching 5s infinite;
		transform-origin: center;
	}

	@keyframes searching {
		0%,
		100% {
			transform: translateX(0) scale(1);
		}
		25% {
			transform: translateX(-2rem) scale(1.1) rotate(-20deg);
		}
		50% {
			transform: translateX(0) scale(1.2) rotate(20deg);
		}
		75% {
			transform: translateX(2rem) scale(1.1) rotate(0deg);
		}
	}

	/* Styles for filters section */
	.filters {
		display: flex;
		flex-wrap: wrap;
		row-gap: 1rem;
		margin-bottom: 3rem;
		margin-top: 3rem;
	}

	.clearFilters {
		text-transform: uppercase;
		font-size: clamp(0.9rem, 2.5vw, 1.1rem);
		font-weight: bold;
		color: var(--content);
		white-space: nowrap;

		padding: 0.5rem 1rem;
		min-width: fit-content;
		text-align: center;
		border: 1px solid #ccc;
		transition: all 0.2s;

		display: flex;
		gap: 3rem;
		align-items: center;
		justify-content: space-between;

		background-color: var(--content-1);
	}

	.clearFilters:hover {
		background-color: #0000002a;
	}

	.clearFilters ion-icon {
		display: flex;
		font-size: 1.2rem;
	}
</style>
