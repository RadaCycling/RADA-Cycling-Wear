<script lang="ts">
	export let title: string;
	export let paragraph: string;
</script>

<div>
	<h2><span>{title}</span></h2>
	<p><span>{paragraph}</span></p>
</div>

<style>
	h2 {
		font-size: clamp(2.5rem, 6vw, 3rem);
		font-weight: 600;
		text-align: center;
	}

	p {
		font-size: clamp(1.25rem, 3vw, 1.5rem);
		font-weight: normal;
		line-height: 1.5;
		margin: auto;
		margin-top: 1.5rem;
	}

	span {
		color: hsl(0 0% 100% / 0.1);
		background-clip: text;
		background-repeat: no-repeat;
		background-size: 0% 100%;
		background-image: linear-gradient(90deg, white, white);

		animation: scrollReveal linear forwards;
		animation-timeline: view(y);
	}

	@media (prefers-reduced-motion) {
		span {
			animation: none;
			background-size: 100% 100%;
		}
	}

	h2 span {
		animation-range-start: cover 10vh;
		animation-range-end: cover 30vh;
	}

	p span {
		animation-range-start: cover 22vh;
		animation-range-end: cover 50vh;
	}

	@keyframes scrollReveal {
		to {
			background-size: 100% 100%;
		}
	}
</style>
