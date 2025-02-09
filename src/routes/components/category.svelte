<script lang="ts">
	import type { Category } from '../mockDb';
	import { baseImageRoute, baseRoute, language, dictionary } from '../stores';

	export let style: string = '';

	export let category: Category;
	export let buttonText: string = $dictionary.collection;
</script>

<div class="category" {style}>
	<img src={category.imageSrc} alt={category.imageAlt[$language]} class="scrollAppear" />
	<div class="text">
		<h2>{category.name[$language]}</h2>
		<a href="{baseRoute}/catalog/{category.href}" class="button">{buttonText}</a>
	</div>
</div>

<style>
	.category {
		display: grid;
		grid-template-rows: repeat(2, 1fr);

		max-width: 422px;
		max-height: 50rem;
	}

	img,
	.text {
		grid-column: 1 / -1;
		grid-row: 1 / -1;
	}

	img {
		height: 100%;
		max-height: min(100vh, 50rem);
		max-height: min(100svh, 50rem);
		border-radius: 5px;

		object-fit: cover;
		box-shadow: 3px 3px 10px #00000050;
	}

	.text {
		align-self: end;

		text-transform: uppercase;

		width: 100%;
		padding: clamp(1rem, 4vw, 2rem) clamp(1.5rem, 6vw, 3rem) clamp(2rem, 8vw, 4rem);

		z-index: 1;

		color: var(--main);
	}

	h2 {
		font-size: clamp(3rem, 8vw, 4rem);
	}

	a {
		font-size: clamp(1.4rem, 4vw, 1.8rem);
		background-color: var(--interactive-8);
	}

	a:hover,
	a:focus-visible {
		background-color: var(--interactive);
	}
</style>
