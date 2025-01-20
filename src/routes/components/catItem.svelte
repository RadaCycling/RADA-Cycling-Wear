<script lang="ts">
	import { baseImageRoute } from '../stores';

	export let icon: string | undefined = undefined;
	export let imageSrc: string | undefined = undefined;
	export let imageAlt: string | undefined = undefined;
	export let name: string;
</script>

<button>
	{#if imageSrc}
		<img src="{baseImageRoute}/{imageSrc}" alt={imageAlt} />
	{:else if icon}
		<ion-icon name={icon} />
	{/if}

	<p>{name}</p>
</button>

<style>
	button {
		--width: 4em;

		flex-grow: 1;
		flex-basis: var(--width);
		flex-shrink: 0;

		font-size: clamp(1rem, 4vw, 1.5rem);

		width: fit-content;
		display: grid;
		gap: 0.3em;
		justify-items: center;
		align-content: space-between;

		border-radius: 10px;
		padding: 0.5rem;
		transition: background-color 0.3s;
	}

	button:hover,
	button:focus-visible {
		background-color: var(--content-1);
	}

	img {
		aspect-ratio: 1 / 1;
		width: calc(var(--width) - 1rem);
		border-radius: 20%;
	}

	ion-icon {
		font-size: 2.5em;
	}

	p {
		text-align: center;
		font-size: 1em;
		font-weight: bold;
		line-height: 1.1;

		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
