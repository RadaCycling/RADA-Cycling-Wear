<script lang="ts">
	import { fade } from 'svelte/transition';
	import { dictionary } from '../../stores';

	export let title: string;
</script>

<svelte:head>
	<title>{$dictionary.admin} | {title}</title>
</svelte:head>

<div in:fade class="admin-page">
	<h1>{title}</h1>
	<main>
		<slot>
			<div style="font-size: 1.1em;">
				{$dictionary.comingSoon}.
			</div>
		</slot>
	</main>
</div>

<style>
	.admin-page {
		padding: 1rem;
		display: grid;
		align-items: center;
		justify-items: center;
	}

	main {
		width: 100%;
		margin: 0 auto;
		border: #00000010 solid 3px;
		border-radius: 20px;
		box-shadow: 0 0 10px #00000010;
		overflow: hidden;
		overflow: clip;
		background-color: #fff;
		padding: 2rem 2rem 1.5rem;
		display: grid;
		align-items: center;
		gap: 1rem;
	}

	h1 {
		margin-bottom: 1.5rem;
		font-size: 2.25rem;
		font-weight: 500;
		border-radius: 15px;
	}

	@media (max-width: 800px) {
		h1 {
			margin-bottom: 1rem;
			font-size: 2rem;
		}

		main {
			padding: 1rem 1rem 1.5rem;
		}
	}
</style>
