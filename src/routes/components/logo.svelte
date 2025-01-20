<script lang="ts">
	import { theme, baseImageRoute } from '../stores';

	export let style: string = '';
	export let version: string = '';

	let src: string;

	function getSource() {
		const darkVersion: string = baseImageRoute + '/logoBlack.webp';
		const lightVersion: string = baseImageRoute + '/logoWhite.webp';

		if (version) {
			if (version === 'light') {
				src = lightVersion;
			} else if (version === 'dark') {
				src = darkVersion;
			}
		} else {
			if ($theme === 'light') {
				src = darkVersion;
			} else {
				src = lightVersion;
			}
		}
	}

	$: $theme, getSource();
</script>

<img {style} {src} alt="Rada Cycling Wear" loading="lazy" />

<style>
	img {
		height: auto;
		width: 9rem;
		user-select: none;
		-webkit-user-drag: none;
	}

	@media screen and (min-width: 500px) {
		img {
			height: auto;
			width: 13.125rem;
		}
	}
</style>
