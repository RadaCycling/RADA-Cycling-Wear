<script lang="ts">
	export let value: string | null | undefined;
	export let id: string | undefined = undefined;
	export let required: boolean = false;
	export let changeCallback: ((...args: any[]) => any) | undefined = undefined;
	export let inputCallback: ((...args: any[]) => any) | undefined = undefined;
	export let blurCallback: ((...args: any[]) => any) | undefined = undefined;
</script>

<input
	{id}
	type="text"
	{required}
	bind:value
	on:change={changeCallback}
	on:input={inputCallback}
	on:blur={blurCallback}
/>

<style>
	input[type='text'] {
		width: 100%;
		font-size: 1.1rem;
		padding: 1rem 1rem 0.75rem;
		color: var(--content);
	}
</style>
