<script lang="ts">
	import type { Badge } from '../types/table';

	export let badge: Badge;
</script>

<a style="background-color: {badge.backgroundColor || ''};" class="badge" href={badge.href}
	>{badge.name}</a
>

<style>
	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		margin-right: 0.25rem;
		border-radius: 5px;
		background-color: #007bff;
		color: white;
		font-size: 0.75rem;
		transition: all 0.3s;
		cursor: pointer;
	}

	.badge:hover {
		filter: brightness(130%);
		transform: scale(1.025);
	}
</style>
