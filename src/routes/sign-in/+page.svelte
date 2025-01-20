<script lang="ts">
	import { fade } from 'svelte/transition';
	import { baseRoute, dictionary } from '../stores';
	import { anErrorOccurred } from '../functions';
	import { authHandlers } from '../auth';
	import Preloader from '../components/preloader.svelte';

	let email: string;
	let password: string;
	let confirmPassword: string;

	let authenticating: boolean = false;

	async function handleFormSubmission() {
		if (password === confirmPassword) {
			authenticating = true;
			await authHandlers.signin(email, password);
			authenticating = false;
		} else {
			anErrorOccurred($dictionary.passwordsDoNotMatch);
			password = '';
			confirmPassword = '';
		}
	}
</script>

<svelte:head>
	<title>{$dictionary.signIn} | RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.signInPageDescription} />
</svelte:head>

{#if authenticating}
	<Preloader animation="dots">
		<h1 class="loadingH1">Rada</h1>
	</Preloader>
{/if}

<div class="signIn" in:fade>
	<h1>{$dictionary.createAnAccount}</h1>
	<form on:submit|preventDefault={handleFormSubmission}>
		<div class="inputGroup">
			<ion-icon name="mail" />
			<input
				type="email"
				placeholder={$dictionary.email}
				class="ghostButton"
				required
				autocapitalize="none"
				autocorrect="false"
				spellcheck="false"
				bind:value={email}
			/>
		</div>
		<div class="inputGroup">
			<ion-icon name="lock-closed" />
			<input
				type="password"
				placeholder={$dictionary.password}
				class="ghostButton"
				required
				bind:value={password}
			/>
		</div>
		<div class="inputGroup">
			<ion-icon name="shield-checkmark" />
			<input
				type="password"
				placeholder={$dictionary.confirmPassword}
				class="ghostButton"
				required
				bind:value={confirmPassword}
			/>
		</div>

		<button type="submit" class="button">{$dictionary.createAnAccount}</button>
	</form>

	<hr />

	<div class="align" style="justify-content: center; font-size: 1.05rem;">
		<p>{$dictionary.alreadyHaveAnAccount}</p>
		<a href="{baseRoute}/my-account" class="link">{$dictionary.logIn}</a>
	</div>
</div>

<style>
	.loadingH1 {
		position: relative;

		font-size: 3.5rem;
		text-transform: uppercase;
	}

	.loadingH1::after {
		content: '';

		position: absolute;
		top: 0;
		right: 0;
		translate: 120% 100%;

		width: 8%;
		aspect-ratio: 1 / 1;
		background-color: var(--interactive);
	}

	.signIn {
		display: flex;
		flex-direction: column;
		justify-content: center;

		max-width: 450px;
		min-height: 100%;
		padding: 6rem 1.5rem;
		margin: auto;

		font-size: clamp(0.95rem, 3vw, 1rem);
	}

	h1 {
		text-wrap: balance;
		text-transform: capitalize;
		text-align: center;
	}

	form {
		display: grid;
		gap: 1rem;

		width: 100%;
		margin-top: 2rem;
	}

	input {
		width: 100%;
		padding: 1em;
		padding-left: 3em;
		background-color: transparent;
	}

	.link {
		font-size: 0.95em;
	}

	.inputGroup {
		position: relative;
	}

	.inputGroup ion-icon {
		position: absolute;
		top: 50%;
		left: 0.7em;
		translate: 0 -50%;

		color: var(--interactive);
	}

	.button {
		width: 100%;
		padding: 0.625em;
		margin-top: 0.5rem;

		color: var(--main);
		text-transform: capitalize;
	}

	.align {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1ch;
		align-items: center;
	}

	hr {
		border: none;
		border-top: 3px solid var(--content-5);
		overflow: visible;
		text-align: center;
		height: 5px;
		margin: 2.5rem 10% 1rem;
	}

	hr:after {
		background: var(--main);
		content: '';
		padding: 0 10%;
		position: relative;
		top: -13px;
	}
</style>
