<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { baseRoute } from '../stores';

	goto(`${baseRoute}/admin/products`);
</script>

<div in:fade class="admin">
	<span />
</div>

<svelte:head>
	<title>Admin | Dashboard</title>
</svelte:head>

<style>
	.admin {
		display: grid;
	}
</style>
