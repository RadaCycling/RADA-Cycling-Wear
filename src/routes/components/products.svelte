<script lang="ts">
	import Product from './product.svelte';
	import type { Product as ProductType } from '../mockDb';

	export let products: ProductType[];

	export let title: string = '';
	export let style: string = '';
	export let maxColumns: number = products.length;
	export let gap: string = '2.5rem';
</script>

<section {style}>
	<h2>{title}</h2>
	<div style="--maxColumns: {maxColumns}; --gap: {gap};" class="modernScrollbar">
		{#each products as item}
			<Product product={item} />
		{/each}
	</div>
</section>

<style>
	section {
		padding: 0 clamp(0.5rem, 4vw, 5rem);

		max-width: fit-content;
	}

	h2 {
		font-size: clamp(1.7rem, 4vw, 2.325rem);
		font-weight: 600;
		text-transform: capitalize;
		margin-bottom: 1rem;
	}

	div {
		--gap: var(--gap, 2.5rem);
		--maxColumns: var(--maxColumns, 12);
		--columns: 4.25;

		padding: 5px 0.5rem 2rem;

		overflow-x: auto;

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: calc(calc(100% / min(var(--columns), var(--maxColumns))) - var(--gap));
		gap: var(--gap);

		box-shadow: 10px 0 10px -10px #00000010, -10px 0 10px -10px #00000010;
	}

	@media screen and (max-width: 100rem) {
		div {
			--columns: 3.2;
		}
	}
	@media screen and (max-width: 70rem) {
		div {
			--columns: 2.25;
		}
	}
	@media screen and (max-width: 50rem) {
		div {
			--columns: 1.77;
		}
	}
	@media screen and (max-width: 35rem) {
		div {
			--columns: 1.15;
		}
	}
</style>
