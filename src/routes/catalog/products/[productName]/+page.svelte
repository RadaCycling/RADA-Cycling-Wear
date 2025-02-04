<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { dictionary, type CartItem, cartItems, language, productsStore } from '../../../stores';
	import Products from '../../../components/products.svelte';
	import Review from '../../../components/review.svelte';
	import {
		type Product,
		type Review as ReviewType,
		addToCart,
		getCartItemFromIDs,
		removeFromCart,
		calculateAverageRating,
		findProductByHref,
		findReviewsByProductId,
		findSimilarProducts,
		findProductsByIds,
	} from '../../../mockDb';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Carousel from '../../../components/carousel.svelte';

	let product: Product | undefined;
	let versions: Product[] | undefined;
	let productInCart: CartItem | undefined;
	let averageRating: string;
	let reviewCount: number;
	let similarProducts: Product[];

	let productReviews: ReviewType[];

	let allSizeOptions = [
		{ id: 16, name: 'XS' },
		{ id: 17, name: 'S' },
		{ id: 18, name: 'M' },
		{ id: 19, name: 'L' },
		{ id: 20, name: 'XL' },
		{ id: 21, name: 'XXL' },
	];
	let sizeOptions: { id: number; name: string }[];

	function getSizeNameById(id: number): string | undefined {
		const sizeOption = allSizeOptions.find((option) => option.id === id);
		return sizeOption?.name;
	}

	let sizeId: number | undefined;
	let sizeName: string | undefined;

	let quantity: number = productInCart?.quantity || 1;
	$: quantity, updateCartQuantity();

	function incrementQuantity() {
		quantity += 1;
	}

	function decrementQuantity() {
		if (quantity > 1) quantity -= 1;
	}

	function updateCartQuantity() {
		if (product && (productInCart || productAdded)) {
			addToCart(product.id, quantity, sizeId);
		}
	}

	let productAdded: boolean = false;
	function toggleProduct() {
		if (product) {
			if (productInCart || productAdded) {
				removeFromCart(
					product.id,
					`${
						product.name[$language] +
						(sizeId ? ' - ' + $dictionary.size + ' ' + sizeName : '')
					}`,
					sizeId,
				);
				productAdded = false;
				productInCart = undefined;
			} else {
				addToCart(
					product.id,
					quantity,
					sizeId,
					`${
						product.name[$language] +
						(sizeId ? ' - ' + $dictionary.size + ' ' + sizeName : '')
					}`,
				);
				productAdded = true;
			}
		}
	}

	function setup() {
		quantity = 1;
		sizeId = undefined;
		sizeName = undefined;

		product = findProductByHref($page.params.productName, $productsStore);

		if (product) {
			versions = product.versionsIds
				? findProductsByIds(product.versionsIds, $productsStore)
				: undefined;
			sizeOptions = allSizeOptions.filter((option) =>
				product?.categoryIds.includes(option.id),
			);

			handleSizeChange(Number($page.url.searchParams.get('sizeID')));

			productReviews = findReviewsByProductId(product.id);

			averageRating = calculateAverageRating(productReviews) || '-';
			reviewCount = productReviews.length;

			similarProducts = findSimilarProducts(product, 8, $productsStore);

			checkIfProductIsInCart();
		}

		if (resetTabWhenNewProduct) {
			currentTab = 'description';
		} else {
			resetTabWhenNewProduct = true;
		}
	}

	function checkIfProductIsInCart() {
		productAdded = false;

		if (product) {
			productInCart = getCartItemFromIDs($cartItems, product.id, sizeId);
			if (productInCart) {
				quantity = productInCart.quantity;
			} else {
				quantity = 1;
			}
		}
	}

	type Tab = 'description' | 'details' | 'reviews';
	let currentTab: Tab = 'description';
	let resetTabWhenNewProduct: boolean = true;

	function changeTab(newTab: Tab) {
		currentTab = newTab;
	}

	function handleSizeChange(id: number) {
		if (sizeId !== id) {
			sizeId = id;
			sizeName = getSizeNameById(id);
		} else {
			sizeId = undefined;
			sizeName = undefined;
		}

		checkIfProductIsInCart();
	}

	onMount(() => setup());
	$: $page.params.productName, setup();
	$: $cartItems, checkIfProductIsInCart();
</script>

{#if product}
	{#key product}
		<div class="product-container" in:fade>
			<div class="image-container">
				<Carousel
					images={product.imageSources}
					imagesCommonDescription={product.imageAlt[$language]}
					hideController={true}
					style="border-radius: 0; aspect-ratio: initial; width: 100%;"
					imgStyle="max-height: max(50vh, 20rem); box-shadow: 0 0 1.5rem var(--content-1);"
					automaticImageChangeTime={60000}
				/>

				{#if versions}
					<div class="versions">
						{#each versions as item}
							<a
								aria-label={item.imageAlt[$language]}
								class:current={product.id === item.id}
								href={item.href}
								on:click={() => (resetTabWhenNewProduct = false)}
							>
								<img
									width="50px"
									src={item.imageSources[0]}
									alt={item.imageAlt[$language]}
								/>
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="product-content">
				<div class="product-head">
					{#key sizeId}
						<h1 class="product-title" in:fade>
							{product.name[$language] +
								(sizeId ? ' - ' + $dictionary.size + ' ' + sizeName : '')}
						</h1>

						<div in:fade class="product-price">{product.price}</div>
					{/key}
				</div>
				<div class="product-rating">
					<span class="rating">{averageRating} ★</span>
					<span class="review-count">({reviewCount} {$dictionary.reviews})</span>
				</div>

				<nav class="product-navigation">
					<button
						type="button"
						class="product-nav-button"
						class:active={currentTab === 'description'}
						on:click={() => changeTab('description')}>{$dictionary.description}</button
					>
					<button
						type="button"
						class="product-nav-button hide"
						class:active={currentTab === 'details'}
						on:click={() => changeTab('details')}>{$dictionary.details}</button
					>
					<button
						type="button"
						class="product-nav-button hide"
						class:active={currentTab === 'reviews'}
						on:click={() => changeTab('reviews')}>{$dictionary.reviews}</button
					>
				</nav>

				{#if currentTab === 'description'}
					<div class="product-description" in:fade>
						<p>{@html product.description[$language]}</p>
					</div>
				{:else if currentTab === 'details'}
					<div class="product-details" in:fade>
						<table>
							<tbody>
								{#each product.details as row}
									<tr>
										<td>{row.label[$language]}</td>
										<td>{row.value[$language]}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else if currentTab === 'reviews'}
					<div class="product-reviews" in:fade>
						{#if productReviews.length > 0}
							<div class="reviews-container">
								{#each productReviews as review}
									<Review {review} />
								{/each}
							</div>
						{:else}
							<p
								style="margin: 1rem 0 2rem; text-align: center; color: var(--content-8)"
							>
								{$dictionary.thisProductHasNoReviews}
							</p>
						{/if}
					</div>
				{/if}

				{#if sizeOptions.length > 0}
					<div class="size-container">
						<h3>{$dictionary.size}</h3>
						<div class="size-selector">
							{#each sizeOptions as option}
								<button
									class:current={sizeId === option.id}
									on:click={() => handleSizeChange(option.id)}
								>
									{option.name}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if sizeOptions.length === 0 || sizeId}
					<div class="quantity-selector">
						<button
							on:click={decrementQuantity}
							class="decrement"
							aria-label="{$dictionary.decreaseQuantityTo} {quantity - 1}"
						>
							<ion-icon name="remove" />
						</button>
						<div class="quantity">{quantity}</div>
						<button
							on:click={incrementQuantity}
							class="increment"
							aria-label="{$dictionary.increaseQuantityTo} {quantity + 1}"
						>
							<ion-icon name="add" />
						</button>
					</div>

					<div class="actions">
						<button in:scale on:click={toggleProduct} class="add-to-cart-btn">
							{#if productInCart || productAdded}
								<div
									in:scale
									style="display: flex; align-items: center; gap: 1ch; margin: -.2em 0"
								>
									<span>{$dictionary.itemAdded}</span>
									<ion-icon name="bag-check-outline" />
								</div>
							{:else}
								<div in:scale>
									<span>{$dictionary.addToCart}</span>
								</div>
							{/if}
						</button>
					</div>
				{:else}
					<p in:scale class="noSize">
						<ion-icon name="alert-circle-outline" />
						<span>{$dictionary.pleaseSelectASize}</span>
					</p>
				{/if}
			</div>
			<div class="similar">
				<Products
					style="padding: 0;"
					maxColumns={2.5}
					title={$dictionary.similarProducts}
					products={similarProducts}
				/>
			</div>
		</div>
	{/key}
{:else}
	<h1
		style="position:absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); font-size: 1.2rem; font-weight: 500;"
	>
		{$dictionary.productNotFound}
	</h1>
{/if}

<svelte:head>
	{#if product}
		<title>{product.name[$language]}</title>
		<meta name="description" content={product.description[$language]} />
	{:else}
		<title>{$dictionary.productNotFound}</title>
	{/if}
</svelte:head>

<style>
	.product-container {
		overflow: hidden;
		margin: auto;
		max-width: 800px;
	}

	.image-container {
		position: relative;
		display: flex;
		justify-content: center;
		z-index: 0;
		padding: 5rem 0 1rem;
	}

	@media screen and (max-width: 750px) {
		.image-container {
			padding-top: 4rem;
		}
	}

	.image-container img {
		max-height: max(50vh, 20rem);
		width: auto;
	}

	.image-container .versions {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);

		display: grid;
		gap: 0.5rem;
	}

	.versions a {
		background: none;
		border-radius: var(--borderRadius, 10px);
		border: none;
		padding: 5px;
		cursor: pointer;
		transition: transform 0.3s ease;
	}

	.versions a:hover {
		transform: scale(1.1);
	}

	.versions a.current img {
		border: 3px solid var(--interactive);
	}

	.versions img {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: var(--borderRadius, 10px);
	}

	.product-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.product-content {
		border-top-right-radius: 20px;
		border-top-left-radius: 20px;
		transform: translateY(-20px);
		background-color: var(--main);
		z-index: 1;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: clamp(1rem, 4vw, 1.2rem);
	}

	.product-title {
		font-size: 1.5em;
		margin-bottom: 0.25em;
	}

	.product-price {
		font-size: 1.375em;
		color: #0a84ff;
		font-weight: bold;
	}

	.product-rating {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.9em;
	}

	.rating {
		color: #e6c10c;
	}

	.review-count {
		color: #6e6e73;
	}

	.product-navigation {
		display: grid;
		grid-auto-flow: column;
		justify-content: space-around;
		margin-top: 1rem;
		border-bottom: solid 1px var(--content-5);
	}

	.product-nav-button {
		text-transform: capitalize;
		padding: 10px 0;
		color: var(--content-8);
		width: fit-content;
		transition: 0.2s;
	}

	.product-nav-button:hover:not(.active),
	.product-nav-button:focus-visible {
		color: var(--content);
	}

	.product-nav-button.active {
		color: red;
		border-bottom: 5px solid var(--interactive);
	}

	.product-description {
		line-height: 1.5;
		padding: 1rem 0;
	}

	.product-details table {
		border-collapse: collapse;
		width: 100%;
		max-width: 600px; /* Adjust this to suit your layout */
		margin: 0.5rem auto;
		border-radius: 8px;
		overflow: hidden;
	}

	.product-details td {
		padding: 10px;
	}

	.product-details td:first-child {
		font-weight: bold;
	}

	.product-details td {
		border: none;
	}

	.reviews-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin: 2rem 0;
	}

	.size-container {
		margin: 2rem auto;

		display: grid;
		gap: 1rem;
	}

	.size-container h3 {
		font-size: 1.2em;
		text-align: center;
	}

	.size-selector {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.size-selector button {
		border-radius: 5px;
		padding: 0.3em 0.8em;

		box-shadow: 2px 2px 10px var(--content-2);

		font-weight: bold;
		text-align: center;

		transition: background-color 0.2s;
	}

	.size-selector button:hover {
		background-color: var(--interactive-1);
	}

	.size-selector button.current {
		border: 3px solid var(--interactive);
		background-color: var(--interactive-1);
	}

	.quantity-selector {
		display: flex;

		margin: 1rem auto;
		border: solid 3px var(--interactive);
		border-radius: 3px;
		width: fit-content;
	}

	.quantity-selector > * {
		display: grid;
		place-items: center;
	}

	.quantity-selector ion-icon {
		font-size: 1.75rem;
	}

	.quantity-selector button {
		--border: solid 2px var(--interactive);
		background-color: var(--interactive);
		color: var(--main);
		font-size: 1.5rem;
		padding: 0.2rem;
	}

	.quantity-selector button:first-of-type {
		border-right: var(--border);
	}

	.quantity-selector button:last-of-type {
		border-left: var(--border);
	}

	.quantity {
		margin: 0 15px;
		font-size: 1.15rem;
		font-weight: bold;
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.add-to-cart-btn {
		background-color: var(--interactive);
		border: none;
		padding: 0.8em 1.75em;
		margin-bottom: 2rem;
		font-weight: bold;
		color: var(--main);
		border-radius: 10px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.add-to-cart-btn:hover {
		filter: brightness(200%);
	}

	.noSize {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1ch;

		margin: 2rem 0 7rem;

		color: var(--interactive);
	}

	.similar {
		margin: 2rem 2rem 4rem;

		display: grid;
		justify-content: center;
	}
</style>
