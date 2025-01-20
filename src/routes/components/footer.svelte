<script lang="ts">
	import { dictionary } from '../stores';

	const currentYear: number = new Date().getFullYear();
</script>

<section>
	<div>
		<a
			href="https://www.instagram.com/rada_cyclingwear/"
			target="_blank"
			class="baseButton"
			aria-label="Instagram"
		>
			<ion-icon name="logo-instagram" />
			<span>Instagram</span>
		</a>
		<a
			href="https://www.facebook.com/rada.cyclingwear/"
			target="_blank"
			class="baseButton"
			aria-label="Facebook"
		>
			<ion-icon name="logo-facebook" />
			<span>Facebook</span>
		</a>
	</div>
</section>

<footer>
	<span>
		{$dictionary.copyright}
		{currentYear} RADA Cycling.
	</span>
	<span>
		{$dictionary.allRightsReserved}
	</span>
</footer>

<style>
	div {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		column-gap: 3ch;
		row-gap: 0.5rem;
	}

	section {
		max-width: 1500px;
		margin: auto;

		padding: 2rem 4rem;
	}

	footer {
		width: fit-content;
		max-width: 1500px;
		margin: auto;

		text-align: center;
		text-wrap: balance;

		padding: 1rem 4rem 3rem;
	}

	ion-icon {
		font-size: 1.8rem;
	}

	span {
		font-size: clamp(1.1rem, 2vw, 1.25rem);
		text-align: center;
		text-wrap: balance;
	}

	@media screen and (min-width: 800px) {
		span {
			font-size: 1.05rem;
		}
	}

	@media screen and (max-width: 600px) {
		section {
			row-gap: 1.5rem;
		}

		a span {
			display: none;
		}
	}
</style>
