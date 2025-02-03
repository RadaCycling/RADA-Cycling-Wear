<script lang="ts">
	import { fade } from 'svelte/transition';
	import { baseRoute } from '../stores';
	import { page } from '$app/stores';
</script>

<div class="admin-layout">
	<aside class="sidebar">
		<nav>
			<ul>
				<li>
					<a
						class="link hide"
						class:active={$page.url.pathname === `${baseRoute}/admin`}
						href="{baseRoute}/admin">Dashboard</a
					>
				</li>
				<li>
					<a
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/products`)}
						href="{baseRoute}/admin/products">Products</a
					>
				</li>
				<li>
					<a
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/categories`)}
						href="{baseRoute}/admin/categories">Categories</a
					>
				</li>
				<li>
					<a
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/portfolio`)}
						href="{baseRoute}/admin/portfolio">Portfolio</a
					>
				</li>
				<li>
					<a
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/orders`)}
						href="{baseRoute}/admin/orders">Orders</a
					>
				</li>
				<li>
					<a
						class="link"
						class:active={$page.url.pathname.includes(`${baseRoute}/admin/messages`)}
						href="{baseRoute}/admin/messages">Messages</a
					>
				</li>
			</ul>
		</nav>
	</aside>
	<div class="content" in:fade>
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
		padding: 1rem;
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
	}

	.sidebar nav ul li {
		margin: 0 1rem;
	}

	.sidebar nav ul li a {
		text-decoration: none;
		font-size: 1rem;
		font-weight: normal;
	}

	.content {
		margin-top: 3rem;
		padding: 2rem 2rem 4rem;
	}

	@media screen and (max-width: 750px) {
		.admin-layout {
			margin-top: 4rem;
		}

		.sidebar {
			top: 4rem;
		}
	}
</style>
