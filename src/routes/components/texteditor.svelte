<script lang="ts">
	export let content: string;
</script>

<div contenteditable="true">
	{@html content}
</div>

<style>
	div[contenteditable] {
		padding: 1rem;
		padding-bottom: 1.5rem;
		font-size: 1.1rem;
		line-height: 1.5;
	}
	div[contenteditable]:focus {
		border: none;
		outline: none;
	}
</style>
