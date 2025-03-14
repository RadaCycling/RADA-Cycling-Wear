<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { TableEntry } from '../../mockDb';
	import { baseImageRoute, dictionary, language } from '../../stores';
	import Toggle from './toggle.svelte';
	import Hamburger from './hamburger.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let content: TableEntry;
	export let specificationsAmount: number = 1;
	export let specificationIndex: number = 0;
	export let allowDelete: boolean = true;
	export let newLabel: string = $dictionary.newSpecification;

	type HamburgerMenuOption = {
		icon?: string;
		color?: string;
		text: string;
		callback: () => void;
	};
	const moveUpOption: HamburgerMenuOption = {
		icon: 'chevron-up',
		text: $dictionary.moveUp,
		callback: () => dispatch('moveUp'),
	};
	const moveDownOption: HamburgerMenuOption = {
		icon: 'chevron-down',
		text: $dictionary.moveDown,
		callback: () => dispatch('moveDown'),
	};
	const deleteOption: HamburgerMenuOption = {
		icon: 'trash',
		color: 'red',
		text: $dictionary.delete,
		callback: () => dispatch('delete'),
	};

	let menu: HamburgerMenuOption[] = [];

	function defineMenuOptions() {
		menu = [];
		if (specificationIndex !== 0) menu = [...menu, moveUpOption];
		if (specificationIndex + 1 !== specificationsAmount) menu = [...menu, moveDownOption];
		if (allowDelete) menu = [...menu, deleteOption];
	}

	onMount(() => {
		defineMenuOptions();
	});
	$: specificationIndex, defineMenuOptions();
	$: specificationsAmount, defineMenuOptions();
</script>

<div in:fade class="specification">
	<header>
		<div>
			<Hamburger {menu} />
			<h4 class="ellipsis">
				{content.label[$language] ? content.label[$language] : newLabel}
			</h4>
		</div>
		<Toggle bind:state={content.status} />
	</header>
	<div class="row">
		<img src="{baseImageRoute}/usFlag.webp" alt="English" lang="en" />
		<input
			type="text"
			bind:value={content.label.en}
			placeholder="{$dictionary.label} ({$dictionary.english})"
		/>
		<input
			type="text"
			bind:value={content.value.en}
			placeholder="{$dictionary.content} ({$dictionary.english})"
		/>
	</div>
	<div class="row spanish">
		<img src="{baseImageRoute}/spainFlag.webp" alt="Español" lang="es" />
		<input
			type="text"
			bind:value={content.label.es}
			placeholder="{$dictionary.label} ({$dictionary.spanish})"
		/>
		<input
			type="text"
			bind:value={content.value.es}
			placeholder="{$dictionary.content} ({$dictionary.spanish})"
		/>
	</div>
</div>

<style>
	.specification {
		display: grid;
		row-gap: 1rem;

		background-color: var(--main-5);
		box-shadow: 5px 5px 10px #00000030;
		padding: 1.5rem 1rem;
		border-radius: 15px;
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		row-gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	header div {
		display: flex;
		align-items: center;
		column-gap: 2ch;
	}

	header div h4 {
		font-size: 1.1em;
		font-weight: 500;
	}

	.ellipsis {
		max-width: 30vw;
	}

	.row {
		display: grid;
		align-items: center;
		gap: 1rem;
		grid-template-columns: auto 1fr 1.5fr;
	}

	img {
		height: 20px;
		width: auto;
		border-radius: 3px;
	}

	input {
		background-color: white;
		border-radius: 5px;
		border: 1px solid var(--content-5);
		font-size: 1em;
		padding: 0.75em;
		width: 100%;
	}

	@media (max-width: 500px) {
		.specification {
			padding: 1.25rem 0.75rem;

			background-color: white;
		}

		header div {
			font-size: 0.95em;
			column-gap: 1ch;
		}

		.row {
			grid-template-columns: auto 1fr;
			column-gap: 0.5rem;
			row-gap: 1rem;
			font-size: 0.95em;
		}

		.row input:last-child {
			grid-column: 2;
		}

		.spanish {
			padding-top: 1rem;
			border-top: #00000030 solid 1px;
		}
	}
</style>
