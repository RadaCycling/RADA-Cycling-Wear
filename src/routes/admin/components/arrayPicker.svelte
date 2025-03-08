<script lang="ts">
	import { clickOutside, letterToAvatarUrl } from '../../functions';
	import type { translatableContent } from '../../mockDb';
	import { createEventDispatcher } from 'svelte';
	import { dictionary, language } from '../../stores';

	const dispatch = createEventDispatcher();

	type ArrayElement = {
		id: any;
		imageSrc?: string;
		imageSources?: string[];
		imageAlt?: translatableContent;
		name: translatableContent;
	};
	export let array: ArrayElement[];
	export let selectedElements: ArrayElement[];
	export let impossibleOptionsIds: any = [];
	let possibleOptions: ArrayElement[] = array.filter((item) => {
		return !selectedElements.includes(item) && !impossibleOptionsIds.includes(item.id);
	});

	export let placeholder: string = '';
	export let id: string = 'new-element';

	let optionsVisible: boolean = false;
	let filterInput: HTMLInputElement;
	let filterText: string = '';

	function setOptions() {
		optionsVisible = true;
		possibleOptions = array.filter((item) => {
			return !selectedElements.includes(item) && !impossibleOptionsIds.includes(item.id);
		});
		possibleOptions = possibleOptions.filter((item) => {
			return (
				`${item.name[$language]} ${item.id}`
					.toLowerCase()
					.includes(filterText.toLowerCase()) || !filterText
			);
		});
	}

	function openOptions() {
		optionsVisible = true;
		setOptions();
	}

	function closeOptions() {
		filterText = '';
		optionsVisible = false;
	}

	function deleteElement(id: any) {
		selectedElements = selectedElements.filter((element: ArrayElement) => {
			return element.id.toString() !== id.toString();
		});
		dispatch('delete');
		dispatch('change');
	}

	function addElement(element: ArrayElement) {
		selectedElements = [element, ...selectedElements];
		dispatch('add');
		dispatch('change');
		closeOptions();
	}
</script>

<div class="search" on:outside={closeOptions} use:clickOutside>
	<label for={id}>
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="icon"
		>
			<path
				d="M11 2a9 9 0 0 1 7.4 14.6l4.3 4.3a1 1 0 0 1-1.4 1.4l-4.3-4.3A9 9 0 1 1 11 2zm0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"
				fill="currentColor"
			/>
		</svg>
	</label>
	<form
		on:submit|preventDefault={() => {
			addElement(possibleOptions[0]);
			filterInput.blur();
		}}
	>
		<input
			type="text"
			autocomplete="off"
			bind:value={filterText}
			bind:this={filterInput}
			on:input={setOptions}
			on:focus={openOptions}
			name={id}
			{id}
			{placeholder}
		/>
	</form>

	{#if optionsVisible}
		<div class="options">
			{#if possibleOptions.length > 0}
				{#each possibleOptions as option}
					<button class="option" on:click={() => addElement(option)}>
						<img
							src={option.imageSrc ||
								option.imageSources?.[0] ||
								letterToAvatarUrl(option.name[$language].charAt(0))}
							alt={option.imageAlt?.[$language]}
						/>
						<div>
							<span class="ellipsis">{option.name[$language]}</span>
							<span class="id ellipsis">{option.id}</span>
						</div>
						<ion-icon style="color: green;" name="add" />
					</button>
				{/each}
			{:else}
				<div style="padding: 1rem 1.5rem;">{$dictionary.noElementsToShow}.</div>
			{/if}
		</div>
	{/if}
</div>
{#if selectedElements.length > 0}
	{#each selectedElements as element}
		<div class="element">
			<img
				src={element.imageSrc ||
					element.imageSources?.[0] ||
					letterToAvatarUrl(element.name[$language].charAt(0))}
				alt={element.imageAlt?.[$language]}
			/>
			<span class="ellipsis">{element.name[$language]}</span>
			<button type="button" on:click={() => deleteElement(element.id)}>
				<ion-icon name="close" />
			</button>
		</div>
	{/each}
{/if}

<style>
	.element,
	.option {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		justify-content: start;
		gap: 2ch;
		padding: 1rem;
		border-top: solid 1px var(--content-2);
	}

	.element img,
	.option img {
		border-radius: 50%;
		box-shadow: 2px 2px 5px #00000010;
		width: 50px;
		height: 50px;
		object-fit: cover;
		object-position: top;
	}

	.element span {
		font-size: 1.1em;
		font-weight: normal;
	}

	.element button {
		margin: 0 1rem;
		border-radius: 50px;
		padding: 0.1em;
		background-color: transparent;
		transition: all 0.1s;
		display: flex;
		color: rgb(187, 17, 17);
	}

	.element button:hover,
	.element button:focus-visible {
		background-color: #00000010;
	}

	.search {
		position: relative;
		padding: 1rem;
		font-size: 1.1em;
	}

	.search svg {
		position: absolute;
		left: calc(1rem + 10px);
		top: 50%;
		transform: translateY(-50%);

		font-size: 1.3em;
		color: var(--content);
	}

	.search input {
		width: 100%;
		padding: 0.5em 1em 0.5em calc(1rem + 30px);
	}

	.options {
		--margin: 0.5rem;
		position: absolute;
		top: calc(100% + var(--margin));
		left: var(--margin);
		right: var(--margin);
		z-index: 1;
		background-color: rgb(255, 255, 255);
		box-shadow: 5px 5px 15px #00000050;
		border: var(--content-2) solid 1px;
		border-radius: 10px;
		max-height: 300px;
		overflow-y: auto;
	}

	.option {
		width: 100%;
		padding-right: 2rem;
	}

	.option div {
		display: grid;
		align-items: center;
		justify-items: start;
	}

	.option div .id {
		font-size: 0.85em;
		color: var(--content-5);
	}

	.option:focus-visible,
	.option:hover {
		background-color: #00000010;
	}

	@media (max-width: 500px) {
		.element img,
		.option img {
			width: 40px;
			height: 40px;
		}

		.element span {
			font-size: 1em;
		}

		.element button {
			margin: 0 0.5rem;
		}

		.search {
			font-size: 1em;
		}

		.search svg {
			left: calc(0.5rem + 10px);
		}

		.search input {
			padding: 0.5em 1em 0.5em calc(0.5rem + 30px);
		}

		.options {
			--margin: 0.25rem;
		}
	}
</style>
