<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		type Product,
		featuredCategories,
		denormalizeCategories,
		findProductsByHrefs,
	} from './mockDb';
	import { baseImageRoute, baseRoute, dictionary, productsStore } from './stores';
	import Landing from './components/landing.svelte';
	import Category from './components/category.svelte';
	import Products from './components/products.svelte';

	const categories = denormalizeCategories(featuredCategories);

	let popular: Product[] = findProductsByHrefs(['men'], $productsStore);
	let latest: Product[] = findProductsByHrefs(['women'], $productsStore);
</script>

<svelte:head>
	<title>RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.siteDescription} />
</svelte:head>

<!-- <LandingForm /> -->

<div class="home" in:fade>
	<Landing />

	<section class="about">
		<img src="{baseImageRoute}/newCollection.jpeg" alt={$dictionary.newCollection} />

		<a class="aboutButton button" href="{baseRoute}/catalog">{$dictionary.newCollection}</a>
	</section>

	<section class="categories">
		{#each categories as category}
			<Category {category} style="flex-grow: 1; flex-basis: 35rem" />
		{/each}
	</section>

	<section class="products scrollAppear hide">
		<Products title={$dictionary.mostPopular} products={popular} />
	</section>

	<section class="promotions">
		<a
			href="{baseRoute}/catalog/products/bib-plus-jerseys"
			class="scrollScale hide"
			aria-label={$dictionary.offerOneBibTwoJerseys}
		>
			<img
				src="{baseImageRoute}/Resources/offer1bib2jerseys.png"
				alt={$dictionary.offerOneBibTwoJerseys}
			/>
		</a>

		<a href="{baseRoute}/custom" class="scrollScale" aria-label={$dictionary.customDeals}>
			<img src="{baseImageRoute}/Resources/radaCustom.png" alt={$dictionary.customDeals} />
		</a>
	</section>

	<section class="products scrollAppear hide">
		<Products title={$dictionary.newCollection} products={latest} />
	</section>

	<section class="features hide">
		<h2 class="scrollAppear">{$dictionary.yourSatisfaction}</h2>

		<div class="featureContainer">
			<div class="scrollScale">
				<ion-icon name="cube-outline" />
				<h3>{$dictionary.swiftFreeShipping}</h3>
				<p>{$dictionary.enjoySeemless}</p>
			</div>
			<div class="scrollScale">
				<ion-icon name="shirt-outline" />
				<h3>{$dictionary.worryFreeReturns}</h3>
				<p>
					{$dictionary.mindPeaceMatters}
				</p>
			</div>
			<div class="scrollScale">
				<ion-icon name="layers-outline" />
				<h3>{$dictionary.effortlessExchanges}</h3>
				<p>
					{$dictionary.needADifferentSize}
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	.home {
		display: grid;
		place-items: center;
	}

	.about {
		position: relative;
		width: 100%;
		height: 7rem;
		min-height: 22rem;
		max-height: clamp(40rem, 5vw, 80rem);
		overflow: hidden;

		width: 100%;

		background-color: black;
	}

	.about img {
		width: 100%;
		height: auto;

		object-fit: contain;
		object-position: center center;
		transform: translateY(-28%);

		filter: opacity(0.35);
		box-shadow: 0 0 5px #00000040;
	}

	.aboutButton {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		font-size: clamp(1.25rem, 3.5vw, 1.5rem);
		color: var(--main);
		font-weight: 600;

		text-transform: uppercase;
		white-space: nowrap;
	}

	.categories {
		--gap: clamp(0.5rem, 4vw, 3rem);

		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 3rem var(--gap);
		gap: calc(var(--gap) / 2);
	}

	.products {
		margin: 2rem 0;
	}

	.promotions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;

		padding: 0 clamp(0.5rem, 4vw, 3rem);
		margin-bottom: 2rem;
		gap: 2rem;
	}

	.promotions a {
		flex-grow: 1;
		flex-basis: 35rem;

		max-width: fit-content;
	}

	.promotions img {
		border-radius: 10px;
		filter: contrast(300%) drop-shadow(0.5rem 0.5rem 1rem var(--interactive-5));
		max-height: 100vh;
		max-height: 100svh;
		box-shadow: 3px 3px 10px #00000050;
	}

	.features {
		padding: 1rem clamp(1rem, 4vw, 3rem) 6rem;
		font-size: clamp(0.9rem, 4vw, 1.2rem);

		display: grid;
		place-items: center;
		gap: 1rem;
		text-align: center;
		width: 100%;
		margin-top: 1rem;
		padding-bottom: 8rem;
	}

	.featureContainer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4rem 3rem;
	}

	.featureContainer div {
		display: grid;
		place-items: center;
		max-width: 20rem;
	}

	.features h2 {
		font-size: 2em;
		margin-bottom: 3rem;
	}

	.features h3 {
		font-size: 1.25em;
		font-weight: 600;
		margin-bottom: 0.5em;
	}

	.features p {
		font-size: 0.95em;
		font-weight: normal;
		color: var(--content-9);
	}

	.features ion-icon {
		font-size: 7rem;
		margin-bottom: 1rem;
	}
</style>
