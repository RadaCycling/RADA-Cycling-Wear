<script lang="ts">
	import './app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		baseImageRoute,
		baseRoute,
		user,
		language,
		dataReady,
		categoriesStore,
		portfolioStore,
		ordersStore,
		messagesStore,
		allProductsStore,
		isAdmin,
	} from './stores';
	import { sleep } from './functions';

	import Nav from './components/nav.svelte';
	import Footer from './components/footer.svelte';
	import Preloader from './components/preloader.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { auth } from '$lib/firebase/rada';
	import { authHandlers } from './auth';
	import type { Product, Category, PortfolioItem, Message, Order } from './mockDb';

	export let data;
	allProductsStore.set(data.products as Product[]);
	categoriesStore.set(data.categories as Category[]);
	portfolioStore.set(data.portfolio as PortfolioItem[]);

	let disappearAndAppear: boolean = false;

	$: $language, checkDisappearAndAppear();

	async function checkDisappearAndAppear() {
		disappearAndAppear = false;
		await sleep(1);
		disappearAndAppear = true;
		await sleep(1100);
		disappearAndAppear = false;
	}

	let layoutReady: boolean = false;
	$: $page.url.pathname, handleURLChange($page.url.pathname);
	let mainContent: HTMLElement;
	let handleURLChange: (newUrl: string) => void = () => {};

	let currentlyCreatingAnonymousAccount = false;

	onMount(() => {
		layoutReady = true;

		handleURLChange = (newUrl: string) => {
			if (document) {
				document.body.scrollTop = 0;
				document.documentElement.scrollTop = 0;
				mainContent.scrollTop = 0;
			}

			if ($user?.email && newUrl === `${baseRoute}/sign-in`) {
				goto(`${baseRoute}/my-account`);
			}
		};

		auth.onAuthStateChanged(async (user) => {
			layoutReady = false;

			if (user) {
				if (user.email && $page.url.pathname === `${baseRoute}/sign-in`) {
					goto(`${baseRoute}/my-account`);
				}

				$user = user;
				const token = await user.getIdToken();
				const response = await fetch('/api/user-data', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const userData = await response.json();
				isAdmin.set(userData.isAdmin);
				ordersStore.set(userData.orders as Order[]);
				messagesStore.set(userData.messages as Message[]);
			} else {
				$user = null;
				if (!currentlyCreatingAnonymousAccount) {
					currentlyCreatingAnonymousAccount = true;
					await authHandlers.signInAnonymously().then(() => {
						currentlyCreatingAnonymousAccount = false;
					});
				}
			}

			layoutReady = true;
		});
	});

	let isCatalogMenuVisible: boolean = false;
</script>

<svelte:head>
	<meta name="author" content="Santiago Ovalles" />
	<link rel="icon" href="{baseImageRoute}/favicon.webp" />
</svelte:head>

<Toaster />
<!-- <Countdown /> -->

<div class:disappearAndAppear>
	<header
		style={isCatalogMenuVisible
			? 'color: var(--content); background-color: var(--main);'
			: 'background-color: var(--content-5); color: var(--main);'}
	>
		<Nav bind:isCatalogMenuVisible />
	</header>

	<main bind:this={mainContent}>
		<slot />
	</main>

	<footer>
		<Footer />
	</footer>

	{#if !layoutReady || !$dataReady}
		<Preloader animation="dots">
			<h1>Rada</h1>
		</Preloader>
	{/if}
</div>

<style>
	div {
		min-height: 100%;
		display: grid;
		grid-template-rows: 1fr auto;
		align-items: center;
	}

	header {
		z-index: 3;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;

		background-color: var(--content-5);
		color: var(--main);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		transition: background-color 0.3s;
	}

	main {
		max-width: 100%;
		align-self: stretch;
	}

	footer {
		border-top: solid 1px var(--content-5);
	}

	:global(.disappearAndAppear) {
		animation: disappearAndAppear 1s;
	}

	@keyframes disappearAndAppear {
		0% {
			opacity: 0.7;
		}
		100% {
			opacity: 1;
		}
	}

	h1 {
		position: relative;

		font-size: 3.5rem;
		text-transform: uppercase;
	}

	h1::after {
		content: '';

		position: absolute;
		top: 0;
		right: 0;
		translate: 120% 100%;

		width: 8%;
		aspect-ratio: 1 / 1;
		background-color: var(--interactive);
	}
</style>
