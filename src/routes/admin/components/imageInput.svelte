<script lang="ts">
	import { flip } from 'svelte/animate';
	import Image from './image.svelte';
	import { repositionElement } from '../../functions';

	export let webSources: string[] | string | null | undefined;
	export let originalSources: string[] | string | null | undefined;
	export let uploadCallback: (...args: any[]) => any;
	export let deleteCallback: (...args: any[]) => any;

	function reposition({ detail }: { detail: number }, index: number) {
		if (!Array.isArray(webSources) || !Array.isArray(originalSources)) return;

		[webSources, originalSources] = [webSources, originalSources].map((arr) =>
			repositionElement(arr, arr[index], detail),
		);
	}
</script>

<div class="image-gallery">
	{#if !webSources || Array.isArray(webSources)}
		<label>
			<ion-icon name="add" />
			<input type="file" multiple on:change={uploadCallback} />
		</label>
	{/if}
	{#if Array.isArray(webSources) && Array.isArray(originalSources)}
		{#each webSources as url, index (url)}
			<div animate:flip={{ duration: 500 }}>
				<Image
					image={{
						source: url,
						alt: originalSources[index],
						position: webSources.length > 1 ? index : undefined,
					}}
					on:delete={() => {
						if (originalSources) deleteCallback(originalSources[index], url);
					}}
					on:reposition={(event) => {
						reposition(event, index);
					}}
				/>
			</div>
		{/each}
	{:else if typeof webSources === 'string' && typeof originalSources === 'string'}
		<Image
			image={{
				source: webSources,
				alt: originalSources,
			}}
			on:delete={() => {
				deleteCallback(originalSources);
			}}
		/>
	{/if}
</div>

<style>
	.image-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1.5rem 1rem 0;
	}

	label {
		position: relative;
		width: 150px;
		height: 150px;

		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--content-1);
		color: var(--content);
		font-size: 2rem;
		border-radius: 10px;
		cursor: pointer;
	}

	label:hover {
		background-color: var(--content-2);
	}

	input[type='file'] {
		display: none;
	}
</style>
