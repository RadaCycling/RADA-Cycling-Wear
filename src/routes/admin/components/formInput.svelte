<script lang="ts">
	export let label: string | undefined = undefined;
	export let value: string | number | null | undefined;
	export let type: 'text' | 'number' = 'text';
	export let id: string | undefined = undefined;
	export let required: boolean = false;
	export let changeCallback: ((...args: any[]) => any) | undefined = undefined;
	export let inputCallback: ((...args: any[]) => any) | undefined = undefined;
	export let blurCallback: ((...args: any[]) => any) | undefined = undefined;
</script>

<div class:two-columns={!!label}>
	{#if label}
		<label for={id}>{label}:</label>
	{/if}

	<!-- Input's type value cannot be dynamic; if statement is necessary -->
	{#if type === 'text'}
		<input
			{id}
			type="text"
			{required}
			bind:value
			on:change={changeCallback}
			on:input={inputCallback}
			on:blur={blurCallback}
		/>
	{:else}
		<input
			{id}
			type="number"
			{required}
			bind:value
			on:change={changeCallback}
			on:input={inputCallback}
			on:blur={blurCallback}
		/>
	{/if}
</div>

<style>
	input {
		width: 100%;
		padding: 1rem 1rem 0.75rem;
		color: var(--content);
	}

	div {
		display: grid;
		grid-template-columns: 1fr;
		justify-content: flex-start;
		align-items: center;

		font-size: 1.1rem;
	}

	.two-columns {
		grid-template-columns: auto 1fr;
		padding: 0.5rem 1rem;
	}

	div:not(:last-child) {
		border-bottom: 1px solid var(--content-2);
	}

	label {
		margin-top: 2.8px;
	}
</style>
