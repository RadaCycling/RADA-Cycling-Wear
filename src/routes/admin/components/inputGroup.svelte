<script lang="ts">
	export let label: string;
	export let focusElementID: string | undefined = undefined;
	export let image: string | undefined = undefined;
	export let alt: string | undefined = undefined;
	export let altLanguageCode: string | undefined = undefined;
	export let removeColon: boolean = false;

	$: label = label.charAt(0).toUpperCase() + label.slice(1);
</script>

<div class="input-group">
	<label class="input-group-label" for={focusElementID}>
		{#if image}
			<img src={image} alt={alt || label} lang={altLanguageCode} />
		{/if}
		<span>{label}{removeColon ? '' : ':'}</span>
	</label>
	<slot />
</div>

<style>
	.input-group {
		position: relative;

		margin-bottom: 1.5rem;
		width: 100%;
		max-width: 600px;
		border: 1px solid var(--content-5);
		border-radius: 5px;
	}

	.input-group-label {
		position: absolute;
		top: 0;
		transform: translateY(-60%);
		left: 0.5rem;

		display: flex;
		align-items: center;
		column-gap: 0.75ch;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--content-5);
		background-color: #ffffff;
		padding: 0.25em 0.5em;
		max-width: 90%;
	}

	.input-group-label img {
		height: 0.8em;
		transform: translateY(0.5px);
		width: auto;
		border-radius: 3px;
	}

	@media (max-width: 400px) {
		.input-group {
			margin-top: 2rem;
		}

		.input-group-label {
			font-size: 0.9rem;
		}
	}
</style>
