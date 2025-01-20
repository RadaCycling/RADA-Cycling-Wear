<script lang="ts">
	import { baseImageRoute, baseRoute, dictionary } from '../stores';

	export let imageSrc: string;
	export let imageAlt: string;
	export let name: string;
	export let price: string;
	export let oldPrice: string | undefined = undefined;
	export let href: string;
</script>

<a href="{baseRoute}/catalog/products/{href}" class="item">
	<img src="{baseImageRoute}/{imageSrc}" alt={imageAlt} />
	<div class="details">
		<h2>{name}</h2>
		{#if oldPrice}
			<div class="oldPrice">
				{oldPrice}
			</div>
		{/if}
		<div class="price">
			{price}
		</div>
	</div>
	<div class="cartRight">
		<button class="add" aria-label={$dictionary.addToCart}>
			<ion-icon name="add" />
		</button>
	</div>
</a>

<style>
	.item {
		display: flex;
		align-items: center;
		border-radius: 10px;
		box-shadow: 0.1rem 0.1rem 1rem var(--content-2);
		padding: 2rem 1rem;

		width: 100%;
		max-width: 750px;
		margin: auto;
	}

	.item img {
		width: 100px;
		height: auto;
		margin-right: 15px;
		border-radius: 4px;
	}

	.details {
		flex-grow: 1;
	}

	.details h2 {
		margin: 0;
		font-size: clamp(1.1rem, 3vw, 1.3rem);
		font-weight: 600;
		color: var(--content-9);
		margin-bottom: 1rem;
	}

	.cartRight {
		display: grid;
		gap: 0.5rem;
		margin-left: 1rem;
		align-self: end;
	}

	.price {
		font-size: clamp(1.1rem, 3vw, 1.3rem);
	}

	.oldPrice {
		font-size: 0.8em;
		color: var(--interactive);
		text-decoration: line-through;
	}

	.add {
		display: none;
		align-items: center;
		gap: 5px;

		padding: 10px 12.5px;
		border: none;
		border-radius: var(--borderRadius, 10px);

		background-color: var(--interactive);
		color: var(--main);

		font-size: clamp(1rem, 3vw, 1.25rem);

		cursor: pointer;
		transition: 0.3s ease;
	}

	.add:hover {
		filter: brightness(120%);
	}

	.add ion-icon {
		--ionicon-stroke-width: 69px;
	}
</style>
