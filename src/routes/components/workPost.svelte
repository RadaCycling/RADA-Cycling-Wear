<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { baseImageRoute, language } from '../stores';
	import type { craftItem } from '../mockDb';

	export let close: () => void;
	export let selectedImage: craftItem;

	// Close modal on Escape key press
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			close();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	const justImage = !selectedImage.title && !selectedImage.description;
</script>

<button class="backdrop" on:click={close}>
	<button
		class:justImage
		class="main"
		on:click|stopPropagation
		in:scale
		out:scale={{ duration: 200 }}
	>
		{#if !justImage}
			<button class="close" on:click={close}><ion-icon name="close-outline" /></button>
		{/if}
		<div class="content">
			<div class="imageContainer">
				<img
					class:justImageImage={justImage}
					src="{baseImageRoute}/{selectedImage.src}"
					alt={selectedImage.alt ? selectedImage.alt[$language] : ''}
				/>
			</div>
			{#if !justImage}
				<div class="description">
					<h2>{selectedImage.title ? selectedImage.title[$language] : ''}</h2>
					<p>
						{selectedImage.description ? selectedImage.description[$language] : ''}
					</p>
				</div>
			{/if}
		</div>
	</button>
</button>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: clamp(0rem, 3vw, 5rem);
	}

	.main {
		position: relative;

		height: 100%;
		width: 100%;
		max-width: 1200px;
		padding: 2rem;

		background-color: white;
		border-radius: 0.5rem;

		cursor: default;
		overflow: auto;
	}

	.close {
		position: absolute;
		top: 1.5em;
		right: 1.5em;

		display: flex;
		font-size: 1.2rem;
		padding: 0.25em;
		background-color: var(--content-5);
		color: var(--main);
		border-radius: 50%;

		z-index: 2;
		transition: background-color 0.2s;
	}

	.close:hover {
		background-color: var(--content-2);
	}

	.content {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.justImage {
		background-color: rgba(255, 255, 255, 0);

		width: fit-content;
		height: fit-content;
		padding: 0 !important;
	}

	.justImageImage {
		aspect-ratio: initial;
	}

	.imageContainer {
		flex-grow: 1;
		flex-shrink: 0;
	}

	img {
		border-radius: 0.5rem;
		max-height: 70vh;
		max-width: 90%;
		aspect-ratio: 6 / 11;
		object-position: center;
		object-fit: cover;

		box-shadow: 2px 2px 10px #00000080;
	}

	.description {
		flex-grow: 0;
		flex-shrink: 1;

		display: grid;
		gap: 1rem;
		align-content: center;
	}

	h2 {
		text-align: center;
		margin: auto;
		max-width: 80%;
	}

	p {
		max-width: 65ch;
		font-size: 1.1rem;
		text-align: left;
		text-wrap: pretty;
		line-height: 1.5;
	}

	@media screen and (max-width: 750px) {
		.main {
			border-radius: 0.5rem;
			padding: 0.5rem 0 3rem;
		}

		.close {
			position: fixed;
		}

		p {
			margin: 0 1.5rem;
		}
	}
</style>
