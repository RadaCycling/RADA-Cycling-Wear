<script lang="ts">
	import { onMount } from 'svelte';
	import { language } from '../../stores';
	import type { Column, Row } from '../types/table';
	import Table from './table.svelte';

	export let allItems: Array<any>;
	export let tableHead: Column[];
	export let itemIntoRowTransformationFunction: (...args: any[]) => Row[];
	export let searchProperties: Array<string>;
	export let controllerTexts: ControllerTexts;
	export let addItemHref: string;

	type ControllerTexts = {
		add: string;
		search: string;
		noMatches: string;
		loading: string;
	};

	let filteredProducts: Array<any> = [];
	let rows: Row[];

	let searchQuery = '';

	$: searchQuery, filter();
	onMount(() => filter());

	function filter() {
		filteredProducts = allItems.filter((item) => {
			if (searchQuery === '') return true;

			for (let index = 0; index < searchProperties.length; index++) {
				const element = searchProperties[index];
				try {
					if (
						typeof item[element] === 'string' &&
						item[element].toLowerCase().includes(searchQuery.toLowerCase())
					) {
						return true;
					} else if (
						typeof item[element] === 'object' &&
						item[element][$language].toLowerCase().includes(searchQuery.toLowerCase())
					) {
						return true;
					}
				} catch (error) {
					console.log(`array[${element}] is neither a string nor TranslatableContent.`);
				}
			}

			return false;
		});

		rows = itemIntoRowTransformationFunction(filteredProducts);
	}
</script>

<div class="header">
	<a class="add-button" href={addItemHref} aria-label={controllerTexts.add}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
			<path
				d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6H5v-2h6V5h2v6h6v2h-6v6z"
			/>
		</svg>
		{controllerTexts.add}
	</a>
	<input
		type="text"
		placeholder="{controllerTexts.search}..."
		bind:value={searchQuery}
		class="search-bar"
	/>
</div>
<div>
	{#if allItems.length > 0}
		{#if rows.length > 0}
			<Table head={tableHead} body={rows} />
		{:else}
			<p>{controllerTexts.noMatches}</p>
		{/if}
	{:else}
		<p>{controllerTexts.loading}...</p>
	{/if}
</div>

<style>
	.header {
		display: flex;
		flex-wrap: wrap-reverse;
		column-gap: 2rem;
		row-gap: 0.5rem;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	@media (max-width: 500px) {
		.header {
			font-size: 0.95rem;
			margin-bottom: 0.75rem;
		}

		.add-button,
		.search-bar {
			width: 100%;
			margin: auto;
		}
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
