<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Head, Row } from '../types/table';
	import Badge from './badge.svelte';
	import Switch from './switch.svelte';

	export let head: Head;
	export let body: Row[];
</script>

<table>
	<thead>
		<tr>
			{#each head as columnHeader}
				<th>
					<div class="th_content">{columnHeader}</div>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each body as row (row)}
			<tr>
				{#each row as cell}
					{#if cell.type === 'image' && typeof cell.content === 'string'}
						<td>
							<a href={cell.link}>
								<img src={cell.content} alt={cell.alt} />
							</a>
						</td>
					{:else if cell.type === 'string'}
						<td class="ellipsis allow-select">
							<a href={cell.link}>
								{cell.content}
							</a>
						</td>
					{:else if cell.type === 'switch' && typeof cell.content === 'boolean' && cell.callback}
						<td class="center-align">
							<Switch bind:state={cell.content} callback={cell.callback} />
						</td>
					{:else if cell.type === 'badgeArray' && typeof cell.content === 'object'}
						<td class="ellipsis">
							{#each cell.content as item}
								<Badge badge={item} />
							{/each}
						</td>
					{:else if cell.type === 'link' && typeof cell.content === 'string'}
						<td class="center-align">
							<a
								class="action-button edit-button"
								href={cell.link}
								aria-label={cell.alt}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
								>
									<path d={cell.content} />
								</svg>
							</a>
						</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}

	tbody tr:not(:last-of-type) {
		border-bottom: 2px solid #00000020;
	}

	.allow-select {
		user-select: text;
		-webkit-user-select: text;
		cursor: text;
	}

	th,
	td {
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-user-select: none;
		user-select: none;
		cursor: default;
	}

	th:not(:first-of-type):not(:last-of-type) {
		padding: 0 0.2rem;
	}

	td {
		padding: 0.5rem 1rem;
	}

	.th_content {
		font-weight: bold;
		border-radius: 5px;
		background-color: #00000010;
		padding: 0.65rem 1rem;
		margin-bottom: 0.5rem;
		text-transform: capitalize;
	}

	td img {
		width: 55px;
		height: 55px;
		margin: 5px 0;
		object-position: top;
		object-fit: cover;
		border-radius: 10px;
		transition: all 0.3s;
	}

	td img:hover {
		filter: brightness(110%);
		transform: scale(1.05);
	}

	.ellipsis {
		max-width: 200px;
	}

	.center-align {
		text-align: center;
	}

	.action-button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--interactive);
		font-size: 1.5rem;
		border-radius: 50%;
		padding: 0.3em;
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		margin: auto;
		transition: all 0.2s;
	}

	.action-button svg {
		fill: var(--interactive);
	}

	.edit-button:hover {
		background-color: #00000010;
		filter: brightness(120%);
		transform: scale(1.05);
	}
</style>
