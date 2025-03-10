<script lang="ts">
	import { baseRoute, language } from '../../stores';
	import { fade } from 'svelte/transition';
	import Dialog from '../components/dialog.svelte';
	import type { translatableContent } from '../../mockDb';
	import FormButton from './formButton.svelte';

	let form: HTMLFormElement;
	let dialogElement: HTMLDialogElement;

	export let object: { name: translatableContent; id: string; [key: string]: any };
	export let isNew: boolean = false;
	export let backLink: string | undefined = undefined;
	export let saveFunction: () => void;
	export let deleteFunction: () => void;
	export let staticText: EditFormText;

	type EditFormText = {
		createTitle: string;
		editTitle: string;
		unnamedSubtitle: string;
		createButton: string;
		saveButton: string;
		deleteButton: string;
		deleteDialogTitle: string;
		deleteDialogDescription: string;
		deleteDialogConfirmButton: string;
	};
</script>

<form in:fade bind:this={form} class="edit-page" on:submit={saveFunction}>
	<!-- Title -->
	<header>
		{#if backLink}
			<div>
				<a href={backLink}>
					<ion-icon name="arrow-back" />
				</a>
				<button type="submit"><ion-icon name="checkmark" /></button>
			</div>
		{/if}
		<h1>{isNew ? staticText.createTitle : staticText.editTitle}</h1>
		<p>{object.name[$language] || staticText.unnamedSubtitle}</p>
	</header>

	<slot />

	<!-- ACTIONS -->
	<section>
		<FormButton
			type="submit"
			ionIcon="checkmark-circle"
			content={isNew ? staticText.createButton : staticText.saveButton}
			color="green"
		/>
		{#if !isNew}
			<FormButton
				callback={() => dialogElement.showModal()}
				ionIcon="trash"
				content={staticText.deleteButton}
				color="rgb(196, 0, 0)"
			/>

			<Dialog
				bind:dialogElement
				parameters={{
					callback: deleteFunction,
					title: staticText.deleteDialogTitle,
					text: staticText.deleteDialogDescription,
					actionButtonText: staticText.deleteDialogConfirmButton,
				}}
			/>
		{/if}
	</section>
</form>

<style>
	.edit-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		background-color: #ffffff;
		border-radius: 20px;
		color: var(--content);
		width: 100%;
		max-width: 1500px;
		margin: auto;
	}

	header {
		max-width: 600px;
		width: 100%;
		position: relative;

		display: grid;
		justify-items: center;
		align-items: center;
		margin-top: -0.5rem;
		margin-bottom: 2rem;
	}

	header div {
		position: absolute;
		left: 0;
		right: 0;
		top: -1rem;

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	header a,
	header button {
		display: flex;
		text-decoration: none;
		color: gray;
		font-size: 1.2rem;
		border-radius: 50%;
		padding: 0.25rem;

		transition: all 0.3s;
	}

	header button {
		color: green;
		font-size: 1.15em;
	}

	header a:hover,
	header button:hover {
		background-color: #00000010;
		transform: scale(1.1);
	}

	header h1 {
		font-size: 2.5rem;
		font-weight: normal;
	}

	header p {
		color: var(--content-5);
		font-weight: bold;
		text-align: center;
	}

	section {
		display: grid;
		row-gap: 1.5rem;

		width: 100%;
		max-width: 700px;
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 500px) {
		.edit-page {
			padding: 2.5rem 1rem 0;
			border-radius: 0;
		}

		header {
			margin-top: 0.5rem;
		}

		header div {
			top: -2.5rem;
		}

		header h1 {
			font-size: 2.2rem;
		}

		section {
			font-size: 0.9rem;
			row-gap: 1.25rem;
		}
	}
</style>
