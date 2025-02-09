<script lang="ts">
	import { sleep } from '../../functions';

	type Dialog = {
		title: string;
		titleColor?: string;
		text: string;
		callback: () => void;
		actionButtonText?: string;
		actionButtonColor?: string;
	};
	export let parameters: Dialog;

	export let dialogElement: HTMLDialogElement;
	let closing: boolean = false;

	async function close() {
		closing = true;
		await sleep(400);
		dialogElement.close();
		closing = false;
	}
</script>

<dialog bind:this={dialogElement} class:closing>
	<form on:submit|preventDefault={parameters.callback} method="dialog">
		<header>
			<h1 style="color: {parameters.titleColor ? parameters.titleColor : ''};">
				{parameters.title}
			</h1>
		</header>
		<main><p>{parameters.text}</p></main>
		<footer>
			<button type="button" on:click={close}>Cancel</button>
			<button
				type="submit"
				style="background-color: {parameters.actionButtonColor
					? parameters.actionButtonColor
					: ''};"
				>{parameters.actionButtonText ? parameters.actionButtonText : 'Continue'}</button
			>
		</footer>
	</form>
</dialog>

<style>
	dialog {
		border-radius: 15px;
		margin: auto;
		padding: 2rem;
		background-color: white;
		border: none;
		box-shadow: 0 0 10px #00000010;
		max-width: 500px;
		width: calc(100% - 3rem);
	}

	header {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: normal;
		color: var(--content);
		text-align: center;
	}

	main {
		margin-bottom: 2rem;
	}

	main p {
		font-size: 1.1em;
		color: var(--content-7);
	}

	footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.3s;
	}

	button[type='button'] {
		background-color: var(--content-1);
	}

	button[type='submit'] {
		background-color: var(--interactive);
		color: var(--main);
	}

	button:hover,
	:focus-visible {
		outline: none;
		transform: scale(1.05);
	}

	button[type='button']:hover,
	button[type='button']:focus-visible {
		background-color: var(--content-2);
	}

	button[type='submit']:hover,
	button[type='submit']:focus-visible {
		filter: brightness(120%);
	}

	dialog {
		animation: fade-in 0.5s;
	}

	dialog::backdrop {
		animation: backdrop-fade-in 0.5s forwards;
	}

	.closing {
		animation: fade-out 0.4s;
	}

	.closing::backdrop {
		animation: backdrop-fade-out 0.4s forwards;
	}

	/* Animation keyframes */

	@keyframes fade-in {
		0% {
			opacity: 0;
			transform: scale(0);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes fade-out {
		0% {
			opacity: 1;
			transform: scale(1);
		}

		100% {
			opacity: 0;
			transform: scale(0);
		}
	}

	@keyframes backdrop-fade-in {
		0% {
			background-color: rgb(0 0 0 / 0%);
		}

		100% {
			background-color: rgb(0 0 0 / 25%);
		}
	}

	@keyframes backdrop-fade-out {
		0% {
			background-color: rgb(0 0 0 / 25%);
		}

		100% {
			background-color: rgb(0 0 0 / 0%);
		}
	}
</style>
