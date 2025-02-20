<script lang="ts">
	import { flip } from 'svelte/animate';
	import Specification from './specification.svelte';
	import { repositionElement } from '../../functions';
	import { dictionary } from '../../stores';
	import type { TableEntry } from '../../mockDb';

	export let elements: TableEntry[];
	export let defaultLabel: string = $dictionary.newSpecification;
	export let addButtonText: string = $dictionary.addASpecification;

	const emptyElement: TableEntry = {
		id: '',
		status: true,
		label: { en: '', es: '' },
		value: { en: '', es: '' },
	};
</script>

<div class="details">
	{#each elements as item, index (item.id)}
		<div animate:flip={{ duration: 500 }}>
			<Specification
				newLabel={defaultLabel}
				content={item}
				specificationIndex={index}
				specificationsAmount={elements.length}
				on:delete={() => {
					elements = elements.filter((detail) => detail !== item);
				}}
				on:moveUp={() => {
					elements = repositionElement(elements, item, index - 1);
				}}
				on:moveDown={() => {
					elements = repositionElement(elements, item, index + 1);
				}}
			/>
		</div>
	{/each}
	<button
		type="button"
		on:click={() => {
			const newDetail = {
				...structuredClone(emptyElement),
				id: crypto.randomUUID(),
			};
			elements = [...elements, newDetail];
		}}
	>
		<ion-icon name="add" />{addButtonText}</button
	>
</div>

<style>
	.details {
		display: grid;
		row-gap: 1.5rem;
	}

	button {
		display: flex;
		align-items: center;
		column-gap: 1ch;

		background-color: var(--main-5);
		box-shadow: 5px 5px 10px #00000030;
		padding: 1.5rem 1rem;
		border-radius: 15px;
	}

	button ion-icon {
		color: green;
	}

	button:hover,
	button:focus-visible {
		background-color: #00000010;
	}
</style>
