<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { baseRoute, dictionary, activeSNavMenu, isAdmin } from '../stores';
	import Base from './base.svelte';
	import { sleep } from '../functions';
	import { goto } from '$app/navigation';
	import Logo from './logo.svelte';
	import { mainMenu } from '../mockDb';

	export let active: boolean = false;

	let firstFocusableElement: HTMLAnchorElement;
	let lastFocusableElement: HTMLAnchorElement;

	$activeSNavMenu = mainMenu;

	async function linkBehaviour(href: string) {
		active = false;

		await sleep(2);
		goto(href);

		$activeSNavMenu = mainMenu;
	}
</script>

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
							on:click|preventDefault={item.href
								? () => (item.href ? linkBehaviour(item.href) : '')
								: item.callback}
							class="dynamicLink {item.classname || 'baseButton'}"
							class:active={$page.url.pathname === item.href}
							style="animation-delay: {index * 75}ms;"
						>
							{#if item.icon}
								<ion-icon name={item.icon} style={item.iconStyle} />
							{/if}
							{item.name}
							{#if !item.href}
								<ion-icon class="notLinkArrowIcon" name="chevron-forward" />
							{/if}
						</a>
					{/each}
				{/if}
			{/key}
		</div>

		<div>
			{#if $isAdmin}
				<a
					class="link adminLink"
					on:click|preventDefault={() => linkBehaviour(`${baseRoute}/admin`)}
					class:active={$page.url.pathname.includes(`${baseRoute}/admin`)}
					href="{baseRoute}/admin"
				>
					<ion-icon name="hammer-outline" />
					{$dictionary.admin}</a
				>
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

<style>
	.dynamicLink {
		translate: -100px;
		opacity: 0;
		animation: fly 0.5s forwards;

		text-transform: capitalize;
		font-weight: 600;
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

		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		gap: 5rem;
	}

	div {
		width: 100%;
		display: grid;
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

		.baseButton {
			font-size: 1rem;
			padding: 0.5em 0.75em;
		}
	}
</style>
