<script>
	import { fade } from 'svelte/transition';
</script>

<div in:fade class="not-available">This page is not available yet.</div>

<svelte:head>
	<title>Admin | Categories</title>
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
