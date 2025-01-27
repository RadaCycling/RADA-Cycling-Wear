<script lang="ts">
	import { onMount } from 'svelte';
	import { baseRoute, dictionary, language, productsStore } from '../stores';
	import { findProductsByIds, type Product, type translatableContent } from '../mockDb';

	export let product: Product;

	let name: translatableContent = product.name;
	let imageSrc: string = product.imageSources[0];
	let imageHoverSource: string | null = product.imageHoverSource;
	let imageAlt: translatableContent = product.imageAlt;
	let price: string = product.price;
	let oldPrice: string | null = product.oldPrice;
	let versions: Product[] | undefined = product.versionsIds
		? findProductsByIds(product.versionsIds, $productsStore)
		: undefined;
	let href: string = product.href;

	let img: HTMLImageElement;

	let originalImageSrc: string;
	function handleImageHover() {
		originalImageSrc = imageSrc;

		if (imageHoverSource) {
			imageSrc = imageHoverSource;
		}
	}
	function handleImageUnhover() {
		if (imageHoverSource) {
			imageSrc = originalImageSrc;
		}
	}

	onMount(() => {
		img.onmouseover = handleImageHover;
		img.onmouseleave = handleImageUnhover;
	});

	function calculateDiscount(oldPrice: string, currentPrice: string): string {
		// Function to extract numeric part from the price string
		const extractNumber = (price: string) => {
			const numericPart = price.replace(/[^0-9.]/g, '');
			return parseFloat(numericPart);
		};

		// Extracting numbers from the provided string prices
		const oldPriceNum = extractNumber(oldPrice);
		const currentPriceNum = extractNumber(currentPrice);

		// Validating extracted numbers to prevent division by zero or negative values
		if (
			isNaN(oldPriceNum) ||
			isNaN(currentPriceNum) ||
			oldPriceNum <= 0 ||
			currentPriceNum > oldPriceNum
		) {
			throw new Error('Invalid price input');
		}

		// Calculating discount percentage
		const discount = ((oldPriceNum - currentPriceNum) / oldPriceNum) * 100;

		// Returning the discount as a formatted string
		return `${discount.toFixed(0)}%`;
	}

	let currentVersionSrc = imageSrc;
	function changeVersion(version: Product) {
		name = version.name;
		imageSrc = version.imageSources[0];
		imageHoverSource = version.imageHoverSource;
		imageAlt = version.imageAlt;
		price = version.price;
		oldPrice = version.oldPrice;
		href = version.href;

		currentVersionSrc = imageSrc;
	}
</script>

<div class="product">
	<a href="{baseRoute}/catalog/products/{href}" aria-label={name[$language]}>
		<img bind:this={img} class="mainImage" src={imageSrc} alt={imageAlt[$language]} />
		{#if oldPrice}
			<p class="discount hide">{calculateDiscount(oldPrice, price)} {$dictionary.discount}</p>
		{/if}
	</a>

	<button class="add baseButton hide" aria-label={$dictionary.addToCart}>+</button>

	<div class="productInfo">
		<div class="left">
			<a href="{baseRoute}/catalog/products/{href}">
				<h2>{name[$language]}</h2>
			</a>
			<div class="prices">
				<p class="price">{price}</p>
				{#if oldPrice}
					<p class="oldPrice">{oldPrice}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if versions}
		<div class="versions">
			{#each versions as item}
				<button
					aria-label={item.imageAlt[$language]}
					class:current={currentVersionSrc === item.imageSources[0]}
					on:click={() => changeVersion(item)}
				>
					<img width="50px" src={item.imageSources[0]} alt={item.imageAlt[$language]} />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.product {
		position: relative;
		max-width: min(25rem, 80vw);
		overflow: hidden;

		font-size: clamp(1rem, 2vw, 1.25rem);
	}

	.mainImage {
		width: 100%;
		max-width: 24rem;
		object-fit: cover;
		display: block;
		border-radius: 5px;
		aspect-ratio: 1 / 1;

		background-color: white;
	}

	.add {
		position: absolute;
		top: 0.35em;
		right: 0.35em;

		padding: 0 0 3px;

		width: 40px;
		height: 40px;

		font-size: 25px;
		font-weight: normal;

		background-color: var(--main-7);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		box-shadow: 1px 1px 10px #00000050;
		color: var(--interactive);
	}

	.add:focus-visible,
	.add:hover {
		background-color: var(--interactive-9);
		color: var(--main);
	}

	.discount {
		position: absolute;
		top: 0.5em;
		right: 0.5em;

		background-color: green;
		border-radius: 5px;
		padding: 0.3em 0.6em;
		max-width: clamp(55%, 10vw, 70%);

		color: white;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.productInfo {
		margin: 1rem 0 0.5rem;
	}

	h2 {
		margin-bottom: 0.15em;

		font-size: 1em;
		font-weight: normal;
		line-height: 1.2;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.prices {
		display: flex;
		align-items: end;
		gap: 0.5ch;
		font-weight: bold;
	}

	p {
		font-size: 1em;
		color: var(--content);
	}

	.oldPrice {
		color: var(--content-7);
		text-decoration: line-through;
		font-size: 0.8em;
	}

	/* Versions Styles */
	.versions {
		display: flex;
	}

	.versions button {
		background: none;
		border-radius: var(--borderRadius, 10px);
		border: none;
		padding: 5px;
		cursor: pointer;
		transition: transform 0.3s ease;
	}

	.versions button:hover {
		transform: scale(1.1);
	}

	.versions button.current img {
		border: 3px solid var(--interactive);
	}

	.versions img {
		width: 45px;
		height: 45px;
		object-fit: cover;
		border-radius: var(--borderRadius, 10px);
	}
</style>
