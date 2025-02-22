<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { dictionary } from '../stores';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	function handleChange(newIndex: number) {
		optionSelectedIndex = newIndex;
		optionsVisible = false;
		dispatch('change');
	}

	export let options: { id: string; name: string }[];
	export let style: string = '';

	let optionsVisible: boolean = false;
	export let optionSelectedIndex: number = 0;

	let trigger: HTMLButtonElement;

	function clickOutside(node: any) {
		const handleClick = (event: any) => {
			if (!node.contains(event.target) && !trigger.contains(event.target)) {
				optionsVisible = false;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			},
		};
	}
</script>

<nav {style}>
	{#key optionSelectedIndex}
		<button
			bind:this={trigger}
			in:fade|global
			class="selectedTeam"
			style={optionsVisible ? 'gap: 4rem;' : ''}
			on:click={() => (optionsVisible = !optionsVisible)}
			aria-label="{$dictionary.selectedOption}: {options[optionSelectedIndex].name}"
		>
			{options[optionSelectedIndex].name}
			<div style={optionsVisible ? 'transform: rotate(180deg);' : 'transform: rotate(0deg);'}>
				<ion-icon name="chevron-down-outline" />
			</div>
		</button>
	{/key}
	{#if optionsVisible}
		<section transition:slide={{ duration: 200 }} use:clickOutside>
			{#each options as name, i}
				<button
					class:selected={i === optionSelectedIndex}
					tabindex={i === optionSelectedIndex ? -1 : 0}
					on:click={() => {
						handleChange(i);
					}}>{name.name}</button
				>
			{/each}
		</section>
	{/if}
</nav>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 1em;
		font-size: 0.8rem;
		transition: all 0.2s;
		height: fit-content;
	}

	nav {
		display: flex;
		flex-direction: column;
		align-items: center;

		position: relative;
	}

	button {
		text-transform: uppercase;
		font-size: clamp(0.9rem, 2vw, 1.1rem);
		font-weight: bold;
		color: var(--content);

		padding: 0.5rem 1rem;
		width: 100%;
		min-width: 10rem;
		text-align: left;
		border: 1px solid #ccc;
		transition: all 0.2s;

		display: flex;
		gap: 3rem;
		align-items: center;
		justify-content: space-between;
	}

	.selected {
		opacity: 0.7;
		cursor: default;
		background-color: #0000002a;
	}

	button:hover:not(:disabled) {
		background-color: #0000002a;
	}

	button:focus-visible:not(.selectedTeam) {
		background-color: var(--interactive);
		color: var(--main);
	}

	.selectedTeam {
		background-color: var(--main);
	}

	.selectedTeam:hover,
	.selectedTeam:focus {
		background-color: var(--main) !important;
	}

	.selectedTeam:focus-visible {
		gap: 4rem;
	}

	section {
		border-radius: 5px;
		background-color: var(--main);
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;

		position: absolute;
		left: 5%;
		top: calc(100% + 1rem);
		box-shadow: 0 0 10px var(--content);
		z-index: 2;
	}
</style>
