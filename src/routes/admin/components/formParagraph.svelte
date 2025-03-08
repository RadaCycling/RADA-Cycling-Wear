<script lang="ts">
	export let content: string;
</script>

<p>{@html content}</p>

<style>
	p {
		margin-bottom: 1.25rem;
		font-size: 1em;
		color: var(--content-7);
	}

	@media (max-width: 500px) {
		p {
			font-size: 0.95em;
		}
	}
</style>
