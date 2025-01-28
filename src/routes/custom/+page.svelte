<script lang="ts">
	import { fade } from 'svelte/transition';
	import { baseImageRoute, dictionary } from '../stores';
	import CustomOverview from '../components/customOverview.svelte';
	import toast from 'svelte-french-toast';
	import PhoneInput from '../components/phoneInput.svelte';

	let phone: string;
	let valid: boolean;

	let isSubmitting: boolean = false;
	export let form;
	$: form, feedbackMessage();

	function feedbackMessage() {
		if (form?.success) {
			toast.success($dictionary.thankYouForYourMessage, { style: 'font-size: 1.2em;' });
		} else if (form?.error) {
			toast.error($dictionary.anErrorHasOccurred, {
				style: 'font-size: 1.2em;',
			});
		}

		isSubmitting = false;
	}
</script>

<svelte:head>
	<title>{$dictionary.custom} | RADA Cycling Wear</title>
	<meta name="description" content={$dictionary.customPageDescription} />
</svelte:head>

<main in:fade>
	<header>
		<img
			class="bg"
			src="{baseImageRoute}/custom/1.webp"
			alt={$dictionary.customPageDescription}
		/>
		<picture>
			<source srcset="{baseImageRoute}/custom/1.webp" media="(max-width: 650px)" />
			<img
				class="fg"
				src="{baseImageRoute}/custom/1.webp"
				alt={$dictionary.customPageDescription}
			/>
		</picture>

		<h1 class="hide">{$dictionary.elevateYourTeamWithCustomDesigns}</h1>
	</header>

	<section id="why-us" class="scrollScale">
		<h2>{$dictionary.whyUsTitle}</h2>
		<p>{$dictionary.whyUsDescription}</p>
		<ul>
			<li>{$dictionary.reflectTeam}</li>
			<li>{$dictionary.highQualityProducts}</li>
			<li>{$dictionary.lowMinimumKits}</li>
			<li>{$dictionary.turnAroundTime}</li>
		</ul>
		<p>{$dictionary.bestChoice}</p>
	</section>

	<section class="formSection">
		<!-- <h2>{$dictionary.contactUs}</h2>
		<p>
			{$dictionary.ifYourLookingForCustom}
			<a class="mailLink" href="mailto:contact@radacyclingwear.com"
				>contact@radacyclingwear.com</a
			>.
		</p> -->

		<form method="post" class="custom-form" on:submit={() => (isSubmitting = true)}>
			<div class="form-row">
				<input
					id="firstName"
					name="firstName"
					type="text"
					placeholder={$dictionary.firstName}
					required
				/>
				<input
					id="lastName"
					name="lastName"
					type="text"
					placeholder={$dictionary.lastName}
					required
				/>
			</div>

			<input
				id="teamName"
				name="teamName"
				type="text"
				placeholder={$dictionary.teamName}
				required
			/>
			<input
				id="email"
				name="email"
				type="email"
				placeholder={$dictionary.yourEmail}
				required
			/>

			<div class="form-row">
				<input class="hide" name="phone" bind:value={phone} />
				<PhoneInput bind:value={phone} bind:valid />
			</div>

			<select id="teamSize" name="teamSize" required>
				<option value="" disabled selected>{$dictionary.teamClubSize}</option>
				<option value="6-10">6-10</option>
				<option value="11-30">11-30</option>
				<option value="31-50">31-50</option>
				<option value="51-100">51-100</option>
				<option value="101-250">101-250</option>
				<option value="251-500">251-500</option>
				<option value="500+">500+</option>
			</select>

			<select id="contactMethod" name="contactMethod" required>
				<option value="" disabled selected>{$dictionary.preferredContactMethod}</option>
				<option value="email">{$dictionary.contactByEmail}</option>
				<option value="whatsapp">{$dictionary.contactByWhatsApp}</option>
			</select>

			<textarea
				id="message"
				name="message"
				placeholder="{$dictionary.message} ({$dictionary.optional})"
				rows="4"
			/>

			<button type="submit" disabled={isSubmitting || !valid}>
				{#if isSubmitting}
					{$dictionary.sending}
				{:else if !valid}
					{$dictionary.invalidPhoneNumber}
				{:else}
					{$dictionary.submit}
				{/if}
			</button>
		</form>
	</section>

	<CustomOverview />
</main>

<style>
	main {
		display: grid;
		place-items: center;
		font-size: clamp(1.1rem, 4vw, 1.25rem);
	}

	h1,
	h2 {
		color: darkred;
		margin-bottom: 20px;
		text-align: center;
	}

	/* .mailLink {
		color: darkred;
	} */

	p {
		line-height: 1.6;
	}

	header {
		position: relative;
		text-align: center;
		width: 100%;
		height: calc(100svh - 20rem);
		height: calc(100svh - 20rem);
		min-height: 22rem;
		max-height: clamp(40rem, 5vw, 80rem);
		margin-bottom: 2rem;
		overflow: hidden;
	}

	header .fg {
		max-width: revert;
		width: 100%;
		height: 100%;

		object-fit: contain;
	}

	@media screen and (max-width: 800px) {
		header .fg {
			object-fit: cover;
		}
	}

	header .bg {
		position: absolute;
		top: 0;
		left: 0;

		max-width: revert;
		width: 100%;
		height: 100%;

		filter: blur(12px);

		object-fit: cover;
		object-position: center 90%;
		z-index: -1;
	}

	header h1 {
		font-size: 2.5em;
		color: white;
		position: absolute;
		top: 50%;
		left: 0;
		transform: translate(0, -50%);
		width: 50%;
		margin-left: 2rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Improves legibility */
	}

	section {
		padding: 1.5em 2rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	input:focus,
	textarea:focus {
		border-color: darkred;
		outline: none;
	}

	button {
		background-color: darkred;
		color: white;
		border: none;
		padding: 10px 20px;
		font-size: 1em;
		cursor: pointer;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #b30000;
	}

	button:disabled {
		background-color: #b30000cc !important;
	}

	ul {
		margin: 2rem 0;
	}

	li {
		margin-left: 2ch;
		margin-bottom: 1rem;
	}

	.formSection {
		width: 100%;
	}

	.custom-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		max-width: 600px;
		margin: auto;
		font-size: 1.1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	input,
	select,
	textarea {
		width: 100%;
		padding: 0.75rem;
		font-size: 1em;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: darkred;
	}

	button {
		width: 100%;
		background-color: darkred;
		color: white;
		border: none;
		padding: 0.75rem;
		font-size: 1em;
		cursor: pointer;
		border-radius: 5px;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #b30000;
	}

	@media (max-width: 650px) {
		.form-row {
			flex-direction: column;
		}

		header h1 {
			font-size: 2em;
			width: 90%;
			left: 50%;
			margin-left: 0;
			transform: translate(-50%);
		}

		header img {
			object-position: center 10%;
		}
	}
</style>
