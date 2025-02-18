<script lang="ts">
	import { fade } from 'svelte/transition';
	import Switch from './switch.svelte';

	export let descriptionBefore: string = '';
	export let descriptionDynamic: { on: string; off: string };
	export let descriptionAfter: string = '';
	export let value: boolean;
	export let callback: ((...args: any[]) => any) | undefined = undefined;
</script>

<i>
	<Switch bind:state={value} style="margin: 1rem;" {callback} />
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
