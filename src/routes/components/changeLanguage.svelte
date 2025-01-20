<script lang="ts">
	import { slide } from 'svelte/transition';
	import { clickOutside } from '../functions';
	import { dictionary, language, type Language } from '../stores';

	export let style: string = '';
	export let buttonStyle: string = 'baseButton';

	function changeLanguage(language: Language) {
		$language = language;
		closeMenu();
	}

	let open: boolean = false;

	function toggleMenu() {
		open = !open;
	}

	async function closeMenu() {
		open = false;
	}
</script>

<div class="changeLanguage" on:outside={closeMenu} use:clickOutside>
	<button class={buttonStyle} {style} on:click={toggleMenu} aria-label={$dictionary.language}>
		{$dictionary.language}
		<ion-icon name="language-outline" />
	</button>

	{#if open}
		<div class="menu" transition:slide={{ duration: 250 }}>
			<button
				class="baseButton"
				{style}
				on:click={() => changeLanguage('en')}
				lang="en"
				aria-label="English"
			>
				English
				<img
					lang={$language}
					src="/images/usFlag.webp"
					alt={$dictionary.unitedStatesFlag}
				/>
			</button>

			<button
				class="baseButton"
				{style}
				on:click={() => changeLanguage('es')}
				lang="es"
				aria-label="Español"
			>
				Español
				<img lang={$language} src="/images/spainFlag.webp" alt={$dictionary.spanishFlag} />
			</button>
		</div>
	{/if}
</div>

<style>
	button {
		width: fit-content;
		font-size: 1.1rem;
	}
	img {
		height: 1rem;
		border-radius: 0.2rem;
		width: auto;
		translate: 0 1px;
	}

	.menu {
		position: absolute;
		top: 100%;

		display: grid;
		gap: 0.5rem;

		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		border: solid 1px var(--content);
		box-shadow: 0 0 1.5rem var(--main);
		border-top: 0;
		padding: 0 0.5em 1em;

		background-color: var(--main);
		z-index: 1;
	}

	.menu button {
		width: 100%;
		justify-content: start;
	}

	@media screen and (min-width: 31rem) {
		button {
			font-size: 1.15rem;
		}
	}
</style>
