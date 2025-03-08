<script lang="ts">
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import {
		findCatalogCategoryByID,
		type CatalogCategory,
		denormalizeCatalogCategory,
	} from '../mockDb';
	import { baseRoute, dictionary, isAdmin, language } from '../stores';
	import Logo from './logo.svelte';
	import SNav from './sNav.svelte';
	import { fade } from 'svelte/transition';
	import { clickOutsideOrChild } from '../functions';

	let active: boolean = false;

	export let isCatalogMenuVisible: boolean = false;
	let catalogMenu: CatalogCategory | undefined;
	let lastMenuOpened: string = '-1';
	function openCatalogMenu(menuID: string) {
		// Get menu information.
		catalogMenu = findCatalogCategoryByID(menuID);
		if (catalogMenu) {
			catalogMenu = denormalizeCatalogCategory(catalogMenu);
		} else {
			toast.error(`There has been an error opening the "${menuID}" menu.`);
		}

		if (lastMenuOpened === menuID && isCatalogMenuVisible) {
			isCatalogMenuVisible = false;
			lastMenuOpened = '-1';
		} else {
			isCatalogMenuVisible = true;
			lastMenuOpened = menuID;
		}
	}
</script>

<nav>
	<section>
		<button
			id="snavToggle"
			class="baseButton s"
			on:click={() => (active = !active)}
			aria-label={$dictionary.siteNavigation}
		>
			<ion-icon name="menu-outline" />
		</button>

		<a class="x" href="{baseRoute}/" aria-label={$dictionary.homepage}>
			{#key isCatalogMenuVisible}
				<Logo version={isCatalogMenuVisible ? 'dark' : 'light'} />
			{/key}
		</a>
	</section>

	<div>
		<section class="links x">
			<a
				class="link"
				class:active={$page.url.pathname === `${baseRoute}/`}
				href="{baseRoute}/">{$dictionary.home}</a
			>
			<button
				class="link"
				class:active={lastMenuOpened === 'menmenu'}
				on:click={() => openCatalogMenu('menmenu')}>{$dictionary.men}</button
			>
			<button
				class="link"
				class:active={lastMenuOpened === 'womenmenu'}
				on:click={() => openCatalogMenu('womenmenu')}>{$dictionary.women}</button
			>
			<a
				class="link"
				class:active={$page.url.pathname === `${baseRoute}/custom`}
				href="{baseRoute}/custom">{$dictionary.custom}</a
			>
			<!-- <a
				class="link"
				class:active={$page.url.pathname === `${baseRoute}/our-work`}
				href="{baseRoute}/our-work">{$dictionary.ourWork}</a
			> -->
			{#if $isAdmin}
				<a
					class="link"
					class:active={$page.url.pathname.includes(`${baseRoute}/admin`)}
					href="{baseRoute}/admin">{$dictionary.admin}</a
				>
			{/if}
		</section>

		<a class="s" href="{baseRoute}/" aria-label={$dictionary.homepage}>
			<Logo />
		</a>
	</div>

	<section class="buttons">
		<!-- <button class="baseButton x">
			<ion-icon name="search-outline" />
		</button> -->
		<a
			href="{baseRoute}/my-account"
			class="baseButton x"
			class:active={$page.url.pathname === `${baseRoute}/my-account`}
			aria-label={$dictionary.myAccount}
		>
			<ion-icon name="person-outline" />
		</a>
		<a
			href="{baseRoute}/cart"
			class="baseButton"
			class:active={$page.url.pathname === `${baseRoute}/cart`}
			aria-label={$dictionary.myAccount}
		>
			<ion-icon name="cart-outline" />
		</a>
		<!-- <button class="baseButton x">
			<ion-icon name="settings-outline" />
		</button> -->
	</section>

	{#if isCatalogMenuVisible && catalogMenu}
		{#key catalogMenu}
			<div
				class="x catalogMenu"
				on:outside={() => {
					isCatalogMenuVisible = false;
					lastMenuOpened = '-1';
				}}
				use:clickOutsideOrChild
				out:fade
			>
				{#each catalogMenu.sections as section}
					<div class="catalogMenuSection" class:celiMenu={!catalogMenu.featuredCategory}>
						<h2>{section.name[$language]}</h2>
						<div class="catalogMenuLinks">
							{#if section.categories}
								{#each section.categories as category}
									<a
										class="link"
										href="{baseRoute}/catalog/{category.href}/{!category.genderSpecific
											? catalogMenu.href
											: ''}">{category.name[$language]}</a
									>
								{/each}
							{/if}
						</div>
					</div>
				{/each}
				{#if catalogMenu.featuredCategory}
					<div class="featuredSection">
						<a
							href="{baseRoute}/catalog/{catalogMenu.featuredCategory
								?.href}/{!catalogMenu.featuredCategory?.genderSpecific
								? lastMenuOpened
								: ''}"
							aria-label={catalogMenu.featuredCategory?.name[$language]}
							class="featuredSectionLink"
						>
							<img
								src={catalogMenu.featuredCategory?.imageSrc}
								alt={catalogMenu.featuredCategory?.imageAlt[$language]}
							/>
							<h2>{catalogMenu.featuredCategory?.name[$language]}</h2>
						</a>
					</div>
				{/if}
			</div>
		{/key}
	{/if}
</nav>

<SNav bind:active />

<style>
	nav {
		position: relative;

		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 3rem;

		padding: 0.5rem 1rem;
		width: 100%;
	}

	.catalogMenu {
		position: absolute;
		top: 100%;
		left: 0;

		background-color: var(--main);
		color: var(--content);
		box-shadow: 0 10px 15px -2px var(--content-2), 0 5px 10px -4px var(--content-1);

		display: flex;
		width: 100%;
		max-height: 50vh;

		opacity: 0;
		animation: fade 0.4s forwards;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.catalogMenu > * {
		flex: 1;
	}

	.catalogMenuSection {
		border: 0.5px solid var(--content-2);
		padding: clamp(1rem, 4vw, 2.5rem);
	}

	.celiMenu {
		display: grid;
		justify-content: center;
	}

	.catalogMenuSection h2 {
		text-transform: uppercase;
		margin-bottom: 1rem;
	}

	.catalogMenuLinks {
		display: grid;
		gap: 0.5rem;
	}

	.catalogMenuLinks a {
		text-transform: capitalize;
		font-size: 1.1rem;
		font-weight: normal;
	}

	.featuredSectionLink {
		width: 100%;
		height: 100%;

		display: grid;
		grid-template-rows: repeat(2, 1fr);
	}

	.featuredSectionLink > * {
		grid-column: 1 / -1;
		grid-row: 1 / -1;
	}

	.featuredSectionLink img {
		width: 100%;
		height: 100%;
		object-position: top;
		object-fit: cover;
	}

	.featuredSectionLink h2 {
		filter: drop-shadow(3px 3px 0.5rem var(--content-8));
		text-transform: uppercase;

		padding: clamp(1rem, 4vw, 2rem);
		color: var(--main);

		z-index: 1;
	}

	a {
		display: flex;
	}

	section {
		display: flex;
		align-items: center;
	}

	.baseButton {
		padding: 0.4em 0.5em;
	}

	#snavToggle ion-icon {
		font-size: 2.325rem;
		transform: translateY(1px);
	}

	.x {
		display: none;
	}

	.links {
		gap: 3em;
	}

	.links .link {
		font-weight: normal;
	}

	.link {
		font-size: 1rem;
		text-transform: uppercase;
	}

	.buttons {
		gap: 0.5rem;
		font-size: 1.25rem;
	}

	@media screen and (min-width: 750px) {
		nav {
			padding: 1.5rem 4rem 1rem;
		}
	}

	@media screen and (min-width: 75rem) {
		.x {
			display: flex;
		}

		.s {
			display: none;
		}

		.buttons {
			font-size: 1.15rem;
		}
	}

	@media screen and (max-width: 500px) {
		nav {
			padding: 0.5rem;
			gap: 1.5rem;
		}

		#snavToggle ion-icon {
			font-size: 2.2rem;
		}
	}
</style>
