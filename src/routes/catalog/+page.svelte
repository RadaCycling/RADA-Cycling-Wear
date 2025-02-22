<script lang="ts">
	import { fade } from 'svelte/transition';
	import { baseImageRoute, dictionary } from '../stores';
	import { findProductsByCategoryHrefs } from '../mockDb';
	import Products from '../components/products.svelte';
</script>

<div class="catalog" in:fade>
	<header>
		<img class="bg" src="{baseImageRoute}/newCollection.jpeg" alt={$dictionary.newCollection} />
		<picture>
			<source srcset="{baseImageRoute}/newCollection.jpeg" media="(max-width: 650px)" />
			<img
				class="fg"
				src="{baseImageRoute}/newCollection.jpeg"
				alt={$dictionary.newCollection}
			/>
		</picture>

		<h1>{$dictionary.newCollection}</h1>
	</header>

	<section>
		<Products title={$dictionary.men} products={findProductsByCategoryHrefs(['men'])} />
	</section>

	<section>
		<Products title={$dictionary.women} products={findProductsByCategoryHrefs(['women'])} />
	</section>
</div>

<svelte:head>
	<title>{$dictionary.catalog} | RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.siteDescription} />
</svelte:head>

<style>
	.catalog {
		margin: auto;
		margin-bottom: 5rem;
	}

	header {
		position: relative;
		text-align: center;
		width: 100%;
		height: calc(100svh - 20rem);
		height: calc(100svh - 20rem);
		min-height: 22rem;
		max-height: clamp(40rem, 5vw, 80rem);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	header .fg {
		max-width: revert;
		width: 100%;
		height: 100%;

		object-fit: contain;
	}

	header .bg {
		position: absolute;
		top: 0;
		left: 0;

		max-width: revert;
		width: 100%;
		height: 100%;

		filter: blur(12px);

		object-fit: cover;
		object-position: center 20%;
		z-index: -1;
	}

	header h1 {
		display: none;

		font-size: 2.5em;
		text-align: center;
		color: white;
		position: absolute;
		top: 50%;
		left: 0;
		transform: translate(0, -50%);
		width: 100%;
		padding: 0 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Improves legibility */
	}

	@media screen and (max-width: 500px) {
		header .fg {
			object-fit: cover;
			object-position: center 20%;
		}

		header h1 {
			display: block;
		}
	}

	/* h2 {
		font-size: clamp(1.7rem, 4vw, 2.25rem);
		text-transform: capitalize;
		margin-bottom: 0.25em;
	} */

	section {
		margin-bottom: 2rem;
		max-width: 1500px;
		margin-inline: auto;
	}
</style>
