<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { dictionary } from '../../stores';

	const dispatch = createEventDispatcher();

	type Image = {
		source: string;
		alt: string;
		position?: number;
	};
	export let image: Image;

	let ionIconOpen: 'open' | 'open-outline' = 'open-outline';
	function fillIonIconOpen() {
		ionIconOpen = 'open';
	}
	function outlineIonIconOpen() {
		ionIconOpen = 'open-outline';
	}

	let ionIconDelete: 'trash' | 'trash-outline' = 'trash-outline';
	function fillIonIconDelete() {
		ionIconDelete = 'trash';
	}
	function outlineIonIconDelete() {
		ionIconDelete = 'trash-outline';
	}

	let positionInput: HTMLInputElement;
	function handlePositionChange() {
		const value = Number(positionInput.value) - 1;

		image.position = value;
		dispatch('reposition', value);
	}
</script>

{#if image.source}
	<div class="image-item">
		<img src={image.source} alt={image.alt} />
		<div class="image-actions">
			<a
				href={image.source}
				target="_blank"
				class="view"
				aria-label="{$dictionary.view} {$dictionary.image}"
				on:mouseover={fillIonIconOpen}
				on:focus={fillIonIconOpen}
				on:mouseleave={outlineIonIconOpen}
				on:blur={outlineIonIconOpen}><ion-icon name={ionIconOpen} /></a
			>
			<button
				type="button"
				class="delete"
				aria-label="{$dictionary.delete} {$dictionary.image}"
				on:click={() => dispatch('delete')}
				on:mouseover={fillIonIconDelete}
				on:focus={fillIonIconDelete}
				on:mouseleave={outlineIonIconDelete}
				on:blur={outlineIonIconDelete}><ion-icon name={ionIconDelete} /></button
			>
			{#if image.position !== undefined}
				<form on:submit|preventDefault={handlePositionChange}>
					<span>{$dictionary.position}:</span>
					<input
						type="number"
						value={image.position + 1}
						bind:this={positionInput}
						on:change={handlePositionChange}
					/>
				</form>
			{:else}
				<a
					style="font-size: 0.9em; color: var(--main-9); direction: rtl;"
					aria-label="{$dictionary.view} {$dictionary.image}"
					class="ellipsis"
					href={image.source}
					target="_blank">{image.alt}</a
				>
			{/if}
		</div>
	</div>
{/if}

<style>
	.image-item {
		position: relative;
		width: 150px;
		height: 150px;
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 10px;
	}

	.image-actions {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		display: flex;
		justify-content: center;
		align-items: center;
		column-gap: 0.5ch;
		background: rgba(0, 0, 0, 0.6);
		color: var(--main);
		opacity: 0;
		transition: opacity 0.3s;
		border-radius: 10px;
	}

	.image-item:hover .image-actions,
	.image-item:focus-within .image-actions {
		opacity: 1;
	}

	.view,
	.delete {
		--size: 0.8em;
		position: absolute;
		top: var(--size);
		left: var(--size);

		font-size: var(--size);

		transition: all 0.05s;
	}
	.view:hover,
	.view:focus-visible,
	.delete:hover,
	.delete:focus-visible {
		transform: scale(1.1);
	}

	.delete {
		right: var(--size);
		left: auto;
		color: rgb(255, 171, 171);
	}

	.ellipsis {
		max-width: 80%;
	}

	input {
		width: 3ch;
	}

	@media (max-width: 500px) {
		.image-item {
			width: 175px;
			height: 175px;
			font-size: 1.1rem;
		}

		form {
			font-size: 1.05rem;
		}
	}
</style>
