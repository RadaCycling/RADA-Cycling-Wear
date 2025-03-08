<script lang="ts">
	export let content: string;
	export let callback: (() => void) | undefined = undefined;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let ionIcon: string | undefined = undefined;
	export let style: string = '';
	export let color: string = 'black';
</script>

<button
	style="--button-color: {color}; color: {color}; {style}"
	{type}
	class="button"
	on:click={callback}
>
	{#if ionIcon}
		<ion-icon name={ionIcon} />
	{/if}
	<span>{content}</span>
</button>

<style>
	.button {
		display: flex;
		align-items: center;
		column-gap: 1ch;
		width: 100%;

		background-color: white;
		box-shadow: 0 0 10px #00000030;
		padding: 1.25rem 1rem;
		border-radius: 15px;

		font-size: 1.2em;
		font-weight: 500;

		transition: all 0.2s ease-out;
	}

	.button:hover {
		box-shadow: 0 0 15px #00000050;
		background-color: var(--button-color, --interactive);
		color: white !important;
	}

	.button ion-icon {
		font-size: 1.15em;
	}
</style>
