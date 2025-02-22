<script lang="ts">
	import { baseRoute, cartItems, dictionary } from '../stores';
	import { denormalizeCartItems } from '../mockDb';
	import { onMount } from 'svelte';

	let cartImages: string[] = [];
	function getCartImages() {
		try {
			if ($cartItems.length > 0) {
				cartImages = denormalizeCartItems($cartItems).map((item) => item.imageSrc);

				$cartItems = [];
			}
		} catch (error) {
			console.error(error);
		}
	}

	onMount(() => {
		getCartImages();
	});

	$: $cartItems, getCartImages();
</script>

<div class="success-page">
	<h1>{$dictionary.thankYouForYourPurchase}</h1>
	<p>{$dictionary.orderPlacedMessage}</p>
	<a href="{baseRoute}/" class="button">{$dictionary.returnToHome}</a>
	<div class="cartImages">
		{#each cartImages as image}
			<img src={image} alt={$dictionary.cartItemPurchased} />
		{/each}
	</div>
</div>

<svelte:head>
	<title>{$dictionary.orderPlacedTitle}</title>
</svelte:head>

<style>
	.success-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100svh;
		text-align: center;
		padding: 5rem 1rem;
	}

	h1 {
		color: var(--interactive);
		margin-bottom: 20px;
	}

	p {
		color: #333;
		font-size: 18px;
		margin-bottom: 40px;
	}

	.button {
		background-color: var(--interactive);
		color: white;
		padding: 15px 30px;
		text-decoration: none;
		border-radius: 5px;
		font-size: 16px;
	}

	.button:hover {
		filter: brightness(120%);
	}

	.cartImages {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 10px;
		margin-top: 40px;
	}

	.cartImages img {
		width: 150px;
		height: 150px;
		object-fit: cover;
		border-radius: 5px;
	}
</style>
