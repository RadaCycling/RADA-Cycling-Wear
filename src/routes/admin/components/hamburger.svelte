<script lang="ts">
	import { slide } from 'svelte/transition';
	import { clickOutside } from '../../functions';

	type HamburgerMenuOption = {
		icon?: string;
		color?: string;
		text: string;
		callback: () => void;
	};
	export let menu: HamburgerMenuOption[];

	let isMenuVisible: boolean = false;

	function toggleMenu() {
		isMenuVisible = !isMenuVisible;
	}

	function hideMenu() {
		if (isMenuVisible) {
			isMenuVisible = false;
		}
	}
</script>

<div class="hamburger" on:outside={hideMenu} use:clickOutside>
	<button class="trigger" type="button" on:click={toggleMenu}>
		<ion-icon name="menu" />
	</button>
	{#if isMenuVisible}
		<menu transition:slide={{ duration: 200 }}>
			{#each menu as item}
				<button
					style="color: {item.color ? item.color : 'inherit'};"
					type="button"
					on:click={() => {
						item.callback();
						toggleMenu();
					}}
				>
					<ion-icon name={item.icon} />
					<span class="ellipsis">
						{item.text}
					</span>
				</button>
			{/each}
		</menu>
	{/if}
</div>

<style>
	.hamburger {
		position: relative;
	}

	.trigger {
		border-radius: 50%;
		display: flex;
		font-size: 1em;
		padding: 0.25em;
		background-color: transparent;
		transition: all 0.2s;
	}

	button:hover,
	button:focus-visible {
		background-color: #00000010;
	}

	menu {
		position: absolute;
		top: calc(100% + 5px);

		display: grid;

		background-color: white;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 2px 2px 10px #00000010;
	}

	menu button {
		width: 100%;
		padding: 0.75em 1em;
		padding-right: 1.5em;

		display: flex;
		gap: 1ch;
	}

	menu button:not(:last-child) {
		border-bottom: 1px solid var(--content-1);
	}

	menu ion-icon {
		font-size: 1em;
	}

	menu span {
		max-width: 100px;
	}
</style>
