<script lang="ts">
	import { fade } from 'svelte/transition';
	import WorkPost from '../components/workPost.svelte';
	import { baseImageRoute, dictionary, language } from '../stores';
	import { crafts, type craftItem } from '../mockDb';

	let images = crafts;

	let selectedImage: craftItem | null = null;

	function selectImage(image: craftItem | null): void {
		selectedImage = image;
	}
</script>

<div class="ourWork" in:fade>
	<div class="header-section hide">
		<h1>{$dictionary.ourCraftmanship}</h1>
		<p>
			{$dictionary.discoverThePassion}
		</p>
	</div>

	<div class="image-grid">
		{#each images as image}
			<button on:click={() => selectImage(image)}>
				<img
					src="{baseImageRoute}/{image.src}"
					alt={image.alt ? image.alt[$language] : ''}
				/>
			</button>
		{/each}
	</div>
</div>

{#if selectedImage}
	<WorkPost close={() => selectImage(null)} {selectedImage} />
{/if}

<svelte:head>
	<title>{$dictionary.ourWork} | RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.discoverThePassion} />
</svelte:head>

<style>
	.ourWork {
		margin: clamp(5rem, 15vw, 7rem) clamp(1rem, 6vw, 5rem);
	}

	.header-section {
		text-align: center;
		padding: 20px;
		margin-bottom: 30px;
		font-size: 1.1rem;
	}
	.header-section h1 {
		font-size: 2em;
		margin-bottom: 0.5em;
	}
	.header-section p {
		font-size: 1em;
		max-width: 60%;
		margin: auto;
		line-height: 1.5;
		max-width: 70ch;
		color: var(--content-9);
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}

	.image-grid img {
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

	.image-grid img:hover {
		transform: scale(1.025);
	}
</style>
