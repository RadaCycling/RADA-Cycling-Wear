<script lang="ts">
	import { dictionary } from '../../stores';

	export let state: boolean;
	export let callback: (...args: any[]) => any;
</script>

<label class="switch">
	<input
		type="checkbox"
		bind:checked={state}
		on:change={() => callback(state)}
		aria-label={state ? $dictionary.deactivate : $dictionary.activate}
	/>
	<span class="slider" />
</label>

<style>
	.switch {
		position: relative;
		display: inline-block;
		width: 34px;
		height: 20px;
		transition: all 0.3s;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.switch:hover {
		filter: brightness(120%);
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 14px;
		width: 14px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: #4caf50;
	}

	input:checked + .slider:before {
		transform: translateX(14px);
	}
</style>
