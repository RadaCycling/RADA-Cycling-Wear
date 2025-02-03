<script lang="ts">
	import { fade } from 'svelte/transition';
	import { dictionary, user, language, type Language, isAdmin } from '../stores';
	import { authHandlers } from '../auth';

	export let authenticating: boolean;

	async function logOut() {
		authenticating = true;
		await authHandlers.logout();
		authenticating = false;
	}

	function setLanguage(lang: Language) {
		language.set(lang);
	}
</script>

<div class="account" in:fade>
	<h1>{$dictionary.myAccount}</h1>
	<div class="account-details">
		<div class="email-section">
			<h2>{$dictionary.email}</h2>
			<p>{$user?.email}</p>
		</div>
		<div class="actions">
			{#if $isAdmin}
				<a href="/admin" class="button">
					<span>{$dictionary.admin}</span>
					<ion-icon name="settings-outline" />
				</a>
			{/if}
			<button class="logOutButton button" on:click={logOut} disabled={authenticating}>
				<span>{$dictionary.logOut}</span>
				<ion-icon name="log-out-outline" />
			</button>
		</div>
	</div>
	<div class="language-section">
		<h2>{$dictionary.language}</h2>
		<div class="language-buttons">
			<button class="language-button" on:click={() => setLanguage('en')}>English</button>
			<button class="language-button" on:click={() => setLanguage('es')}>Español</button>
		</div>
	</div>
</div>

<style>
	.account {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background-color: var(--main);
		text-align: center;
	}

	h1 {
		color: var(--content);
		margin-bottom: 20px;
		font-size: 2rem;
		font-weight: 500;
	}

	.account-details {
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 600px;
		margin-bottom: 40px;
	}

	.email-section {
		margin-bottom: 20px;
	}

	h2 {
		color: var(--interactive);
		margin-bottom: 10px;
		font-size: 1.5rem;
	}

	p {
		color: var(--content);
		font-size: 1rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	.button {
		background-color: var(--interactive);
		color: white;
		padding: 10px 20px;
		text-decoration: none;
		border-radius: 5px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.button:hover {
		filter: brightness(120%);
	}

	.logOutButton {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.language-section {
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 600px;
	}

	.language-buttons {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-top: 10px;
	}

	.language-button {
		background-color: var(--interactive);
		color: white;
		padding: 10px 20px;
		text-decoration: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
	}

	.language-button:hover {
		filter: brightness(120%);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 1.75rem;
		}

		.account-details,
		.language-section {
			padding: 1.5rem;
		}

		h2 {
			font-size: 1.25rem;
		}

		.button,
		.language-button {
			padding: 8px 16px;
			font-size: 0.875rem;
		}
	}
</style>
