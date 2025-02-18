<script lang="ts">
	import { baseRoute, language } from '../../stores';
	import { fade } from 'svelte/transition';
	import Dialog from '../components/dialog.svelte';
	import type { translatableContent } from '../../mockDb';

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

<form in:fade bind:this={form} class="edit-page">
	<!-- Title -->
	<header>
		{#if backLink}
			<a href="{baseRoute}/admin/products">
				<ion-icon name="close" />
			</a>
		{/if}
		<h1>{isNew ? staticText.createTitle : staticText.editTitle}</h1>
		<p>{object.name[$language] || staticText.unnamedSubtitle}</p>
	</header>

	<slot />

	<!-- ACTIONS -->
	<section class="button-group">
		<button type="submit" class="button save-button" on:click={saveFunction}>
			<ion-icon name="checkmark-circle" />
			<span>
				{isNew ? staticText.createButton : staticText.saveButton}
			</span>
		</button>
		{#if !isNew}
			<button
				type="button"
				class="button delete-button"
				on:click={() => dialogElement.showModal()}
			>
				<ion-icon name="trash" />
				<span>{staticText.deleteButton}</span>
			</button>

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
		padding: 2rem;
		background-color: #ffffffaa;
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

	header a {
		position: absolute;
		right: 0;
		top: -1rem;

		display: flex;
		align-items: center;
		text-decoration: none;
		color: var(--content-5);
		font-size: 1.2rem;
		border-radius: 50%;
		padding: 0.25rem;

		transition: all 0.3s;
	}

	header a:hover {
		color: var(--content-8);
		background-color: #ffffff;
		box-shadow: 0 0 10px #fff;
		transform: scale(1.1);
	}

	header p {
		color: var(--content-5);
		font-weight: bold;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: normal;
	}

	section {
		width: 100%;
		max-width: 700px;
		margin-bottom: 2rem;

		border: #00000010 solid 3px;
		border-radius: 20px;
		box-shadow: 0 0 10px #00000010;
		background-color: #fff;
		padding: 2rem 2rem 1.5rem;
	}

	.button-group {
		display: grid;
		margin-top: 1rem;
		row-gap: 1.5rem;
		padding: 0;
		background-color: transparent;
		box-shadow: none;
		border: none;
	}

	.button {
		display: flex;
		align-items: center;
		column-gap: 1ch;
		width: 100%;

		background-color: white;
		box-shadow: 0 0 10px #00000030;
		padding: 1.25rem 1rem;
		border-radius: 15px;

		font-size: 1.2rem;
		font-weight: 500;

		transition: all 0.2s ease-out;
	}

	.button:hover {
		box-shadow: 0 0 15px #00000050;
		background-color: var(--interactive);
		color: var(--main);
	}

	.button ion-icon {
		font-size: 1.15em;
	}

	.save-button {
		color: green;
	}

	.delete-button {
		color: rgb(196, 0, 0);
	}

	.save-button:hover {
		background-color: green;
	}

	.delete-button:hover {
		background-color: rgb(196, 0, 0);
	}
</style>
