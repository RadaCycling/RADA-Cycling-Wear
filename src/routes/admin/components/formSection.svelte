<script lang="ts">
	export let title: string;
	$: title = title.charAt(0).toUpperCase() + title.slice(1);
</script>

<section>
	<h2>{title}</h2>
	<div>
		<slot />
	</div>
</section>

<style>
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

	section h2 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
		font-weight: 500;
	}

	section div {
		padding-left: 1.5rem;
		padding-bottom: 0.5rem;
		border-left: 2px solid var(--content-2);
	}
</style>
