<script lang="ts">
	import { dictionary } from '../stores';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let array: any[];
	export let currentFileIndex: number;

	function handleButtonClick(index: number) {
		currentFileIndex = index;
		dispatch('interaction');
	}
</script>

<div>
	{#each array as i, index}
		<button
			aria-label="{$dictionary.image} {index + 1}"
			on:click={() => handleButtonClick(index)}
			class:active={index === currentFileIndex}
			tabindex={index === currentFileIndex ? -1 : 0}
		/>
	{/each}
</div>

<style>
	div {
		display: flex;
		gap: 1.5em;
	}

	div button {
		border-radius: 50px;
		background-color: var(--content-7);
		height: 12px;
		width: 20px;
		transition: all 0.2s;
	}

	div button:not(.active):hover,
	div button:not(.active):focus-visible {
		width: 30px;
		background-color: var(--content-9);
	}

	div .active {
		width: 50px;
		cursor: default;
		background-color: var(--content);
	}

	@media screen and (max-width: 500px) {
		div {
			gap: 1em;
		}

		div button {
			height: 10px;
			width: 15px;
		}

		div button:not(.active):hover,
		div button:not(.active):focus-visible {
			width: 20px;
		}

		div .active {
			width: 40px;
		}
	}
</style>
