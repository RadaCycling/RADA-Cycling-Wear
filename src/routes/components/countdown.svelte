<script lang="ts">
	import { scale } from 'svelte/transition';

	function getRemainingTimeUntil(targetDate: Date): string {
		const now = new Date();
		const difference = targetDate.getTime() - now.getTime();

		if (difference <= 0) {
			return "Time's up!";
		}

		const seconds = Math.floor((difference / 1000) % 60);
		const minutes = Math.floor((difference / 1000 / 60) % 60);
		const hours = Math.floor(difference / (1000 * 60 * 60));

		return `${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`;
	}

	// Set the target date
	const targetDate = new Date('March 12, 2024 20:50:00');

	// This function will update the countdown every second
	let content: string;
	function startCountdown() {
		const updateCountdown = () => {
			const timeLeftString = getRemainingTimeUntil(targetDate);
			content = timeLeftString;
		};

		updateCountdown(); // Initial update
		setInterval(updateCountdown, 1000); // Update every second
	}

	// Call startCountdown() when you want to start the countdown
	startCountdown();

	// Control div visibility.
	let isVisible: boolean = true;

	function hideCountdown() {
		isVisible = false;
		setTimeout(() => (isVisible = true), 5000);
	}
</script>

{#if isVisible}
	<button transition:scale on:click={hideCountdown}>{content}</button>
{/if}

<style>
	button {
		position: fixed;
		top: 100px;
		left: 50%;
		translate: -50% -30%;

		background-color: var(--interactive);
		color: var(--main);
		box-shadow: 2px 2px 10px #00000001;

		padding: 10px 15px;
		border-radius: 5px;

		font-size: 1.1rem;
		font-weight: bold;
		letter-spacing: 0.05ch;
		text-align: center;

		z-index: 2313;

		scale: 0.8;
		opacity: 0.1;
		transition: 0.25s;
	}

	button:hover {
		opacity: 1;
		scale: 1;
	}
</style>
