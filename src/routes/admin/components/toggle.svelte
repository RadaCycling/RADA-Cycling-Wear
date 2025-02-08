<script lang="ts">
	import { fade } from 'svelte/transition';

	// Prop to control toggle state
	export let state: boolean = false;

	// Emit event when toggled
	const toggle = () => {
		state = !state;
	};
</script>

<button type="button" class="toggle-container {state ? 'on' : 'off'}" on:click={toggle}>
	<div class="toggle-button" in:fade>
		<span>{state ? 'On' : 'Off'}</span>
	</div>
	<span class="toggle-label off">Off</span>
	<span class="toggle-label on">On</span>
</button>

<style>
	.toggle-container {
		--width: 90px;
		--height: 35px;
		--padding: 5px;

		display: flex;
		align-items: center;
		width: var(--width);
		height: var(--height);
		border-radius: 10px;
		background-color: #02ac79db;
		box-shadow: 0 0 10px #00000010;
		cursor: pointer;
		position: relative;
		transition: all 0.3s ease-in-out;
		font-size: 0.9rem;
	}

	.toggle-container:hover {
		filter: brightness(110%);
	}

	.toggle-container.off {
		background-color: #ccc;
	}

	.toggle-button {
		background: white;
		border-radius: 7px;
		width: calc(var(--width) / 2 - var(--padding));
		height: calc(var(--height) - var(--padding) * 2);
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		left: var(--padding);
		transition: transform 0.3s ease-in-out;
	}

	.toggle-container.on .toggle-button {
		transform: translateX(calc(var(--width) / 2 - var(--padding)));
	}

	.toggle-label {
		color: var(--main-6);
		transition: color 0.3s;
		width: calc(var(--width) / 2);
		text-align: center;
		font-size: 0.95em;
		font-weight: 500;
	}

	.toggle-label.on {
		color: white;
	}
</style>
