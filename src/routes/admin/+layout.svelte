<script lang="ts">
	import { fade } from 'svelte/transition';
	import { activeAdminPage, baseRoute, dictionary } from '../stores';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`${baseRoute}/admin/${$activeAdminPage || 'products'}`);
	});
</script>

<div class="admin-layout">
	<aside class="sidebar x">
		<nav>
			<ul>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = '';
						}}
						class="link"
						class:active={$page.url.pathname === `${baseRoute}/admin`}
						href="{baseRoute}/admin">{$dictionary.dashboard}</a
					>
				</li>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = 'products';
						}}
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/products`)}
						href="{baseRoute}/admin/products">{$dictionary.products}</a
					>
				</li>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = 'categories';
						}}
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/categories`)}
						href="{baseRoute}/admin/categories">{$dictionary.categories}</a
					>
				</li>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = 'portfolio';
						}}
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/portfolio`)}
						href="{baseRoute}/admin/portfolio">{$dictionary.portfolio}</a
					>
				</li>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = 'orders';
						}}
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/orders`)}
						href="{baseRoute}/admin/orders">{$dictionary.orders}</a
					>
				</li>
				<li>
					<a
						on:click={() => {
							$activeAdminPage = 'messages';
						}}
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/messages`)}
						href="{baseRoute}/admin/messages">{$dictionary.messages}</a
					>
				</li>
			</ul>
		</nav>
	</aside>
	<div class="content" in:fade>
		<div class="sidebar-initial-space x" />
		<slot />
	</div>
</div>

<style>
	.admin-layout {
		display: grid;
		margin-top: 5rem;
	}

	.sidebar {
		width: 100%;
		padding: 1rem 2rem;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);

		position: fixed;
		top: 5rem;
		left: 0;

		background-color: #ffffff90;
		color: var(--content);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);

		z-index: 2;
	}

	.sidebar nav {
		display: flex;
		justify-content: space-between;
	}

	.sidebar nav ul {
		list-style: none;
		padding: 0;

		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.sidebar nav ul li a {
		text-decoration: none;
		font-size: 1rem;
		font-weight: normal;
	}

	.sidebar-initial-space {
		height: 3rem;
		width: 100%;
	}

	.content {
		padding: 2rem 2rem 4rem;
	}

	@media (max-width: 950px) {
		.content {
			padding: 1.5rem 0 4rem;
		}
	}

	@media screen and (max-width: 750px) {
		.admin-layout {
			margin-top: 4rem;
		}
	}

	@media screen and (max-width: 500px) {
		.content {
			padding: 0rem 0 4rem;
		}
	}
</style>
