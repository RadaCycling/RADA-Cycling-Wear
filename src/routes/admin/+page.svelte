<script>
	import { fade } from 'svelte/transition';
	import { baseRoute, dictionary } from '../stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	onMount(() => {
		toast($dictionary.comingSoon);
		goto(`${baseRoute}/admin/products`);
	});
</script>

<div in:fade class="not-available">This page is not available yet.</div>

<svelte:head>
	<title>Admin | Dashboard</title>
</svelte:head>

<style>
	.not-available {
		width: 100%;
		text-align: center;
		margin-top: 2rem;
		font-size: 1.25rem;
		color: #555;
	}
</style>
