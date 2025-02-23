<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { baseRoute, cartItems, dictionary } from '../stores';
	import {
		denormalizeCartItems,
		type DenormalizedCartItem,
		removeFromCart,
		addToCart,
		sizeCategoryIds,
	} from '../mockDb';
	import { onMount } from 'svelte';

	let promoCode = '';

	let denormalizedData: DenormalizedCartItem[];

	function getCartItems() {
		try {
			denormalizedData = denormalizeCartItems($cartItems);
		} catch (error) {
			console.error(error);
		}
	}

	function calculateSubtotal() {
		let subtotal = denormalizedData.reduce((total, item) => total + item.totalItemPrice, 0);
		return subtotal;
	}

	onMount(() => {
		getCartItems();
	});
	$: $cartItems, getCartItems();
</script>

<div class="cart" in:fade>
	{#key $cartItems}
		{#if denormalizedData.length > 0}
			<div class="header">
				<h1>{$dictionary.myCart}</h1>
			</div>
			{#each denormalizedData as item (`${item.productId}-${item.sizeId}`)}
				<div class="cart-item" transition:slide>
					<a
						href="{baseRoute}/catalog/products/{item.href}{sizeCategoryIds.includes(
							item.sizeId || '',
						)
							? '?sizeID=' + item.sizeId
							: ''}"
						class="imageLink"
					>
						<img src={item.imageSrc} alt={item.name} />
					</a>
					<div class="item-details">
						<a
							href="{baseRoute}/catalog/products/{item.href}{sizeCategoryIds.includes(
								item.sizeId || '',
							)
								? '?sizeID=' + item.sizeId
								: ''}"
						>
							<h2>{item.name}</h2>
						</a>
						<p>{$dictionary.price}: {item.price}</p>
						<div class="quantity-selector">
							<button
								on:click={() =>
									addToCart(
										item.productId,
										Math.max(1, item.quantity - 1),
										item.sizeId,
									)}
							>
								<ion-icon name="remove" />
							</button>
							<span class="quantity">{item.quantity}</span>
							<button
								on:click={() =>
									addToCart(item.productId, item.quantity + 1, item.sizeId)}
							>
								<ion-icon name="add" />
							</button>
						</div>
					</div>
					<div class="cartRight">
						<button
							class="close"
							on:click={() => removeFromCart(item.productId, item.name, item.sizeId)}
						>
							<ion-icon name="close" />
						</button>
						<div class="item-price">
							<span><strong>{$dictionary.total}:</strong></span>
							<span>${item.totalItemPrice.toFixed(2)}</span>
						</div>
					</div>
				</div>
			{/each}

			<div class="pricing">
				<div>{$dictionary.totalAmount}: ${calculateSubtotal().toFixed(2)}</div>
			</div>
			<form method="post">
				<input type="hidden" name="cartItems" value={JSON.stringify(denormalizedData)} />
				<button type="submit" class="checkout-button">{$dictionary.checkout}</button>
			</form>
		{:else}
			<div class="emptyCart">
				<ion-icon name="bag-remove" />
				<h1>{$dictionary.yourCartIsEmpty}</h1>
				<p>{$dictionary.looksLikeYouHaventMadeYourChoice}</p>
				<a class="button exploreButton" href="{baseRoute}/catalog"
					>{$dictionary.exploreOurCatalog}</a
				>
			</div>
		{/if}
	{/key}
</div>

<svelte:head>
	<title>{$dictionary.myCart} | RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.siteDescription} />
</svelte:head>

<style>
	.cart {
		max-width: 800px;
		min-height: 100%;
		margin: 6rem auto 3rem;
		padding: 0 1.25rem;
	}

	@media (max-width: 749px) {
		.cart {
			margin: 5rem auto 3rem;
			padding: 0 1.25rem;
		}
	}

	.header {
		text-align: left;
		border-bottom: 1px solid var(--content-8);
		padding-bottom: 10px;
	}

	h1 {
		font-size: clamp(1.5rem, 3.5vw, 1.75rem);
		font-weight: 600;
	}

	.cart-item {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--content-7);
		padding: 2rem 0;
	}

	.imageLink {
		margin-right: 15px;
	}

	.cart-item img {
		width: 100px;
		height: auto;
		border-radius: 4px;
	}

	.item-details {
		flex-grow: 1;
	}

	.item-details h2 {
		margin: 0;
		font-size: 1.1em;
		color: var(--content-9);
	}

	.item-details p {
		margin: 5px 0;
		font-size: 1em;
		color: var(--content);
	}

	.cartRight {
		align-self: baseline;

		display: grid;
		gap: 1rem;
		margin-left: 1rem;
		justify-items: end;
	}

	.close {
		display: flex;
		border-radius: 50%;
		padding: 0.25em;
		width: fit-content;

		background-color: transparent;
		transition: background-color 0.2s;
	}

	.close:hover {
		background-color: var(--content-2);
	}

	.quantity-selector {
		display: flex;

		margin: 1rem 0;
		border: solid 2px var(--interactive);
		border-radius: 3px;
		width: fit-content;
	}

	.quantity-selector > * {
		display: grid;
		place-items: center;
	}

	.quantity-selector ion-icon {
		font-size: 1.5rem;
	}

	.quantity-selector button {
		--border: solid 2px var(--interactive);
		background-color: var(--interactive);
		color: var(--main);
		padding: 0.2rem;
	}

	.quantity-selector button:first-of-type {
		border-right: var(--border);
	}

	.quantity-selector button:last-of-type {
		border-left: var(--border);
	}

	.quantity {
		margin: 0 10px;
		font-size: 1em;
	}

	.item-price {
		display: grid;
		font-size: 1.1em;
		text-align: end;
	}

	.pricing {
		text-align: right;
		margin: 2rem 0 1rem;
		display: grid;
		gap: 1em;
		font-size: 1.1em;
		font-weight: 500;
	}

	.checkout-button {
		display: block;
		text-align: center;
		text-transform: uppercase;
		width: 100%;
		background-color: var(--interactive);
		color: var(--main);
		border: none;
		padding: 12px;
		margin-bottom: 2rem;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		border-radius: 4px;
	}

	.emptyCart {
		display: grid;
		place-content: center;
		place-items: center;
		gap: 0.5rem;
		min-height: 60vh;
	}

	.emptyCart h1 {
		text-transform: capitalize;
	}

	.emptyCart p {
		font-size: 1.1rem;
		text-align: center;
	}

	.emptyCart a {
		text-transform: capitalize;
		font-size: 1.05rem;
		color: var(--main);
		margin-top: 1rem;
		padding: 0.5em 1em;
	}

	.emptyCart ion-icon {
		font-size: 3rem;
		color: var(--interactive);
		margin: 0 auto 20px;
		animation: bounce 1.5s infinite;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-25px);
		}
		60% {
			transform: translateY(-15px);
		}
	}
</style>
