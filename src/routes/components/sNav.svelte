<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import {
		baseRoute,
		dictionary,
		activeSNavMenu,
		isAdmin,
		activeAdminPage,
		language,
	} from '../stores';
	import Base from './base.svelte';
	import { sleep } from '../functions';
	import { goto } from '$app/navigation';
	import Logo from './logo.svelte';
	import { getMainMenu } from '../mockDb';

	export let active: boolean = false;

	let firstFocusableElement: HTMLAnchorElement;
	let lastFocusableElement: HTMLAnchorElement;

	function restartMenu() {
		$activeSNavMenu = getMainMenu();
	}

	$: $language, restartMenu();

	async function linkBehaviour(href: string) {
		active = false;

		await sleep(2);
		goto(href);

		restartMenu();
	}

	$: adminMenu = [
		{
			name: $dictionary.admin,
			callback: restartMenu,
			classname: 'baseButton backButton',
		},
		{
			name: $dictionary.dashboard,
			href: `${baseRoute}/admin/`,
			callback: () => ($activeAdminPage = ''),
			classname: 'baseButton',
			icon: 'speedometer',
		},
		{
			name: $dictionary.products,
			href: `${baseRoute}/admin/products`,
			callback: () => ($activeAdminPage = 'products'),
			classname: 'baseButton',
			icon: 'cube',
		},
		{
			name: $dictionary.categories,
			href: `${baseRoute}/admin/categories`,
			callback: () => ($activeAdminPage = 'categories'),
			classname: 'baseButton',
			icon: 'list',
		},
		{
			name: $dictionary.portfolio,
			href: `${baseRoute}/admin/portfolio`,
			callback: () => ($activeAdminPage = 'portfolio'),
			classname: 'baseButton',
			icon: 'images',
		},
		{
			name: $dictionary.orders,
			href: `${baseRoute}/admin/orders`,
			callback: () => ($activeAdminPage = 'orders'),
			classname: 'baseButton',
			icon: 'cart',
		},
		{
			name: $dictionary.messages,
			href: `${baseRoute}/admin/messages`,
			callback: () => ($activeAdminPage = 'messages'),
			classname: 'baseButton',
			icon: 'mail',
		},
	];
</script>

<div class="s">
	<Base
		bind:active
		{firstFocusableElement}
		{lastFocusableElement}
		style="background-color: var(--content-4)"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<nav on:click|stopPropagation transition:slide|global={{ duration: 200, axis: 'x' }}>
			<div>
				<a
					bind:this={firstFocusableElement}
					style="margin: 0 auto 2rem;"
					href="{baseRoute}/"
					on:click|preventDefault={() => linkBehaviour(`${baseRoute}/`)}
					aria-label={$dictionary.homepage}
				>
					<Logo version="dark" />
				</a>

				{#key $activeSNavMenu}
					{#if $activeSNavMenu}
						{#each $activeSNavMenu as item, index}
							<a
								href={item.href}
								on:click|preventDefault={() => {
									if (item.callback) item.callback();
									if (item.href) linkBehaviour(item.href);
								}}
								class="dynamicLink {item.classname || 'baseButton'}"
								class:active={item.href &&
									(item.href.slice(-1) === '/'
										? $page.url.pathname === item.href
										: $page.url.pathname.includes(item.href))}
								style="animation-delay: {index * 75}ms;"
							>
								{#if item.icon}
									<ion-icon name={item.icon} style={item.iconStyle} />
								{/if}
								<span
									class="ellipsis"
									style="--extra-elements-width: {0 +
										(item.icon ? 3.5 : 0) +
										(item.href ? 0 : 3)}rem"
								>
									{item.name}
								</span>
								{#if !item.href}
									<ion-icon class="notLinkArrowIcon" name="chevron-forward" />
								{/if}
							</a>
						{/each}
					{/if}
				{/key}
			</div>

			<div>
				{#if $isAdmin && $activeSNavMenu !== adminMenu}
					<button
						on:click|preventDefault={() => ($activeSNavMenu = adminMenu)}
						class="dynamicLink baseButton"
						style="animation-delay: 75ms;"
					>
						<ion-icon name="hammer" style="font-size: 1.5em; margin-left: 2px;" />
						<span class="ellipsis" style="--extra-elements-width: 6rem">
							{$dictionary.admin}
						</span>
						<ion-icon class="notLinkArrowIcon" name="chevron-forward" />
					</button>
				{/if}
				<section>
					<a
						href="https://www.instagram.com/rada_cyclingwear/"
						target="_blank"
						on:click={() => (active = false)}
						class="baseButton"
						aria-label="Instagram"
					>
						<ion-icon name="logo-instagram" />
					</a>
					<a
						href="https://www.facebook.com/rada.cyclingwear/"
						target="_blank"
						on:click|preventDefault={() => (active = false)}
						class="baseButton"
						aria-label="Facebook"
						bind:this={lastFocusableElement}
					>
						<ion-icon name="logo-facebook" />
					</a>
				</section>
			</div>
		</nav>
	</Base>
</div>

<style>
	.dynamicLink {
		translate: -100px;
		opacity: 0;
		animation: fly 0.5s forwards;

		text-transform: capitalize;
		font-weight: 600;
	}

	.dynamicLink span {
		--extra-elements-width: 0rem;
		max-width: calc(50vw - var(--extra-elements-width));
	}

	.extraSpaceLink {
		margin-bottom: 0.5rem;
	}

	.backButton {
		position: relative;
		margin-bottom: 3rem;
	}

	.backButton::after {
		content: '';
		position: absolute;
		bottom: -2rem;
		left: 0;

		width: 100%;
		height: 1px;
		border-radius: 5px;

		background-color: var(--content);
	}

	.backButton ion-icon {
		rotate: 180deg;
	}

	.notLinkArrowIcon {
		margin-left: auto;
		font-size: 1.4em;
	}

	@keyframes fly {
		from {
			translate: -100px 0;
			opacity: 0;
		}

		to {
			translate: 0;
			opacity: 1;
		}
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		height: 100dvh;
		width: 38ch;
		max-width: 70%;
		z-index: 3;
		background-color: var(--main);
		color: var(--content);
		border-right: solid 2px var(--content);
		padding: 3rem 2rem;

		transition: all 0.3s;
		overflow: auto;

		display: grid;
		grid-template-rows: 1fr auto;
		row-gap: 2rem;
		align-items: center;
	}

	div {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	.baseButton {
		font-size: 1.1rem;
		width: 100%;
		justify-content: flex-start;
		text-align: left;
	}

	a {
		user-select: none;
	}

	.adminLink {
		margin: auto;
		display: flex;
		gap: 0.5ch;
	}

	section {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 2ch;
		row-gap: 0.5rem;
	}

	section .baseButton {
		width: fit-content;
		padding: 0.3em;
		font-size: 1.2rem;
	}

	@media screen and (max-width: 500px) {
		nav {
			width: 35ch;
			padding: 3rem 1.5rem;
		}

		.dynamicLink span {
			font-weight: 500;
		}

		.baseButton {
			font-size: 1rem;
			padding: 0.5em 0.75em;
		}
	}
</style>
