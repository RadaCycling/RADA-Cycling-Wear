<script lang="ts">
	import { crafts, type craftItem } from '../mockDb';
	import { baseImageRoute, dictionary, language } from '../stores';
	import WorkPost from './workPost.svelte';

	export let style: string = '';

	// Get only the first three elements from crafts
	let images = crafts.slice(0, 3);

	let selectedImage: craftItem | null = null;

	function selectImage(image: craftItem | null): void {
		selectedImage = image;
	}
</script>

<section id="gallery" {style} class="scrollScale">
	<h2>{$dictionary.someOfOurCustomWork}</h2>
	<div>
		{#each images as image}
			<button class="scrollAppear" on:click={() => selectImage(image)}>
				<img
					src="{baseImageRoute}/{image.src}"
					alt={image.alt ? image.alt[$language] : ''}
				/>
			</button>
		{/each}
	</div>
	<a class="moreWork" href="our-work">{$dictionary.viewMore}</a>
</section>

{#if selectedImage}
	<WorkPost close={() => selectImage(null)} {selectedImage} />
{/if}

<style>
	h2 {
		color: darkred;
		margin-bottom: 20px;
		text-align: center;
	}

	#gallery {
		display: grid;
		padding: 3.5em 2rem;
	}

	#gallery div {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.25rem;
	}

	#gallery img {
		border: 3px solid darkred;
		border-radius: 5px;
		transition: transform 0.3s ease;
		width: 100%;
		aspect-ratio: 6 / 11;
		max-width: 300px;
		object-fit: cover;
		object-position: center;
		height: auto;
		cursor: pointer;
	}

	#gallery img:hover {
		transform: scale(1.025);
	}

	.moreWork {
		width: 15rem;
		max-width: 100%;

		margin: auto;
		margin-top: 2rem;
		padding: 10px 20px;
		border: none;
		border-radius: 5px;

		background-color: darkred;

		text-transform: capitalize;
		font-size: 1em;
		text-align: center;
		color: white;

		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.moreWork:hover {
		background-color: #b30000;
	}
</style>
