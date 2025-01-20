<script lang="ts">
	import { fade } from 'svelte/transition';
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
