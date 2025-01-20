<script lang="ts">
	import { fade } from 'svelte/transition';
	import { db } from '$lib/firebase/rada';
	import { doc, setDoc, getDoc } from 'firebase/firestore';
	import { baseRoute, dictionary, userID } from '../stores';
	import { anErrorOccurred } from '../functions';
	import { onMount } from 'svelte';

	let firstName: string;
	let lastName: string;
	let email: string;
	let phone: string;
	let termsAccepted: boolean = false;

	let formHasBeenSent: boolean = true;
	let isOpen: boolean = false;

	function close() {
		isOpen = false;
	}

	async function checkIfFormFilled() {
		if (!$userID) {
			return;
		}

		// Create a reference to the Firestore document
		const userInfoDocumentReference = doc(db, 'user', $userID, 'info', 'discountForm');

		try {
			const docSnapshot = await getDoc(userInfoDocumentReference);

			if (!docSnapshot.exists()) {
				// If the document exists, it means the form has already been filled
				formHasBeenSent = false;
				isOpen = true;
			}
		} catch (error) {
			anErrorOccurred();
		}
	}

	async function saveFormData() {
		if (!$userID) {
			anErrorOccurred();
			return;
		} else if (!termsAccepted) {
			anErrorOccurred($dictionary.dataPolicyNotAccepted);
			return;
		}

		// Create a reference to the Firestore document
		const userInfoDocumentReference = doc(db, 'user', $userID, 'info', 'discountForm');

		// Create an object with the form data
		const formData = {
			firstName,
			lastName,
			email,
			phone,
			timestamp: new Date(),
		};

		try {
			// Save the data to Firestore
			await setDoc(userInfoDocumentReference, formData);
			formHasBeenSent = true;
		} catch (error) {
			anErrorOccurred();
		}
	}

	$: $userID, checkIfFormFilled();

	onMount(() => {
		checkIfFormFilled();
	});
</script>

{#if isOpen}
	{#if formHasBeenSent}
		<div out:fade class="success">
			<div class="success-content">
				<ion-icon name="checkmark-circle-outline" class="success-icon" />
				<div class="success-message">
					<h3>{$dictionary.success}</h3>
					<p>
						{$dictionary.informationSubmitted}
					</p>
				</div>
				<button on:click={close} class="close" type="button" aria-label={$dictionary.close}>
					<ion-icon name="close-outline" />
				</button>
			</div>
		</div>
	{:else}
		<div in:fade={{ duration: 300 }} class="landingForm">
			<!-- Head -->
			<div class="head">
				<h2>{$dictionary.discountOnNextPurchase}</h2>
				<button on:click={close} class="close" type="button" aria-label={$dictionary.close}>
					<ion-icon name="close-outline" />
				</button>
			</div>
			<p>{$dictionary.completeFormForDiscount}</p>

			<!-- Body -->
			<form on:submit={saveFormData}>
				<div class="a">
					<div class="firstName inputGroup">
						<label for="firstName">{$dictionary.firstName}</label>
						<input
							bind:value={firstName}
							required
							type="text"
							name="firstName"
							id="firstName"
						/>
					</div>
					<div class="lastName inputGroup">
						<label for="lastName">{$dictionary.lastName}</label>
						<input
							bind:value={lastName}
							required
							type="text"
							name="lastName"
							id="lastName"
						/>
					</div>
					<div class="email inputGroup">
						<label for="email">{$dictionary.email}</label>
						<input bind:value={email} required type="email" name="email" id="email" />
					</div>
					<div class="phone inputGroup">
						<label for="phone">{$dictionary.phoneNumber}</label>
						<input bind:value={phone} required type="tel" name="phone" id="phone" />
					</div>
				</div>
				<div class="b">
					<div class="terms">
						<label for="terms">
							<span>{$dictionary.iAcceptThe}</span>
							<a href={baseRoute}>{$dictionary.dataPolicy}</a>
						</label>
						<input
							bind:checked={termsAccepted}
							type="checkbox"
							name="terms"
							id="terms"
						/>
					</div>
				</div>

				<!-- Submit -->
				<button type="submit">{$dictionary.submit}</button>
			</form>
		</div>
	{/if}
{/if}

<style>
	.landingForm {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 350px;
		max-height: 90vh;
		overflow-y: auto;
		background-color: #fff;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
		border-radius: 8px;
		padding: 20px;
		z-index: 1000;
		font-family: Arial, sans-serif;
		color: #333;
		animation: slideUp 0.5s ease-in-out;
	}

	.head {
		display: flex;
		gap: 1em;
		justify-content: space-between;
	}

	h2 {
		font-size: 18px;
		color: #e74c3c;
		margin-bottom: 10px;
	}

	.close {
		display: flex;
		width: fit-content;
		height: fit-content;

		color: var(--content);
		padding: 0.2em;
		border-radius: 50%;

		background-color: transparent;
		transition: background-color 0.2s;
	}

	.close:hover {
		background-color: var(--content-1);
	}

	p {
		font-size: 14px;
		margin-bottom: 20px;
		color: #777;
	}

	.inputGroup {
		margin-bottom: 15px;
	}

	.inputGroup label {
		display: block;
		margin-bottom: 5px;
		font-size: 14px;
		color: #555;
	}

	.inputGroup input {
		width: 100%;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		color: #333;
	}

	@media screen and (max-width: 750px) {
		h2 {
			font-size: 20px;
		}

		.inputGroup input {
			font-size: 1em;
		}
	}

	.b {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.terms {
		display: flex;
		align-items: center;
		margin-bottom: 1em;
	}

	.terms label {
		margin-left: 5px;
		padding-right: 1ch;
		font-size: 12px;
	}

	@media screen and (max-width: 750px) {
		.terms label {
			font-size: 13px;
		}
	}

	.terms a {
		color: #3498db;
		text-decoration: none;
	}

	.terms a:hover {
		text-decoration: underline;
	}

	button {
		width: 100%;
		padding: 10px;
		background-color: #e74c3c;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		cursor: pointer;
	}

	button:hover {
		background-color: #c0392b;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@media (max-width: 400px) {
		.landingForm {
			width: 100%;
			bottom: 0;
			right: 0;
			border-radius: 0;
		}
	}

	/* Success message */
	.success {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 350px;
		background-color: var(--main);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
		border-radius: 8px;
		padding: 20px;
		z-index: 1000;
		animation: slideUp 0.5s ease-in-out;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.success-content {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.success-icon {
		font-size: 75px;
		color: green;
	}

	.success-message {
		flex-grow: 1;
	}

	.success-message h3 {
		font-size: 18px;
		margin: 0;
		color: green;
	}

	.success-message p {
		margin: 5px 0 0;
		font-size: 14px;
		color: #333;
	}

	@media (max-width: 400px) {
		.success {
			width: 100%;
			bottom: 0;
			right: 0;
			border-radius: 0;
		}
	}
</style>
