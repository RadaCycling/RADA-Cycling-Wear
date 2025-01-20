<script lang="ts">
	export let header: string;
	export let content: string;
	export let customStyle: string = '';

	let tooltipVisible = false;

	function showTooltip() {
		tooltipVisible = true;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="tooltip"
	on:mouseenter={showTooltip}
	on:mouseleave={hideTooltip}
	aria-roledescription={content}
>
	<slot />
	{#if tooltipVisible}
		<div class="tooltip-content" style={customStyle}>
			<strong>{header}</strong>
			<p>{content}</p>
		</div>
	{/if}
</div>

<style>
	.tooltip {
		position: relative;
		display: inline-block;
	}

	.tooltip-content {
		visibility: hidden;
		width: 120px;
		background-color: black;
		color: white;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;
		position: absolute;
		z-index: 1;
	}

	.tooltip:hover .tooltip-content {
		visibility: visible;
	}
</style>
