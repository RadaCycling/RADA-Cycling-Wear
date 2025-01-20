<!-- Add "on:click|stopPropagation" property to parent div placed in the 'slot' position -->

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { sleep } from '../functions';

	export let firstFocusableElement: HTMLElement;
	export let lastFocusableElement: HTMLElement;
	export let active: boolean = true;
	export let style: string = '';

	function focusFirstElement() {
		if (firstFocusableElement) {
			firstFocusableElement.focus();
		}
	}

	function focusLastElement() {
		if (lastFocusableElement) {
			lastFocusableElement.focus();
		}
	}

	async function bringFocus() {
		await sleep(1);

		if (lastFocusableElement) {
			lastFocusableElement.focus();
			lastFocusableElement.blur();
		}
	}

	$: active, bringFocus();
</script>

<svelte:window
	on:keydown={(event) => {
		if (active && event.key === 'Escape') active = false;
	}}
/>

{#if active}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="base"
		in:fade|global={{ duration: 100 }}
		out:fade|global={{ duration: 100, delay: 100 }}
		on:click={() => (active = false)}
		{style}
	>
		<button style="position: absolute; opacity: 0;" on:focus={focusLastElement} />

		<slot />

		<button style="position: absolute; opacity: 0;" on:focus={focusFirstElement} />
	</div>
{/if}

<style>
	.base {
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		padding: 150px 20px 100px;
		background-color: var(--main-9);
		overflow: auto;
		z-index: 11;
	}
</style>
