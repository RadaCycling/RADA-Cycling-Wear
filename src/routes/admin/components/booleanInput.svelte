<script lang="ts">
	import { fade } from 'svelte/transition';
	import Switch from './switch.svelte';

	export let descriptionBefore: string = '';
	export let descriptionDynamic: { on: string; off: string };
	export let descriptionAfter: string = '';
	export let value: boolean;
	export let callback: ((...args: any[]) => any) | undefined = undefined;
</script>

<div>
	<Switch bind:state={value} {callback} />
	<i>
		<span>{descriptionBefore}</span>
		{#key value}
			<b in:fade
				>{value ? descriptionDynamic.on : descriptionDynamic.off}{!descriptionAfter
					? '.'
					: ''}</b
			>
		{/key}
		{#if descriptionAfter}
			<span>{descriptionAfter}.</span>
		{/if}
	</i>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		margin: 1rem;
		gap: 1rem;
	}
</style>
