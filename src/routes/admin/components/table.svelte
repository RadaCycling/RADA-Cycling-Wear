<script lang="ts">
	import type { Head, Row } from '../types/table';
	import Badge from './badge.svelte';
	import Switch from './switch.svelte';

	export let head: Head;
	export let body: Row[];

	let innerWidth: number;

	// Compute which column indices should be visible.
	$: visibleIndices = computeVisibleIndices(innerWidth);

	function computeVisibleIndices(width: number) {
		// Assume each column needs at least 200px.
		const minWidth = 200;
		// How many columns can we fit?
		const maxColumns = Math.max(1, Math.floor(width / minWidth));

		// Separate required columns (those without importance) from optional ones.
		const requiredColumns = head
			.map((col, index) => ({ index, hasImportance: col.importance !== undefined }))
			.filter((col) => !col.hasImportance)
			.map((col) => col.index);

		const optionalColumns = head
			.map((col, index) => ({
				index,
				importance: col.importance || 0,
			}))
			.filter((col) => col.importance > 0);

		// Sort optional columns by importance (descending)
		optionalColumns.sort((a, b) => b.importance - a.importance);

		// Determine how many optional columns can fit
		const remainingSlots = Math.max(maxColumns - requiredColumns.length, 0);
		const selectedOptionalIndices = optionalColumns
			.slice(0, remainingSlots)
			.map((col) => col.index);

		// Combine required and selected optional indices
		const visibleIndices = [...requiredColumns, ...selectedOptionalIndices];

		// Sort indices to preserve the original column order
		visibleIndices.sort((a, b) => a - b);

		return visibleIndices;
	}
</script>

<!-- Bind the window's innerWidth -->
<svelte:window bind:innerWidth />

<div>
	<table>
		<thead>
			<tr>
				{#each visibleIndices as i}
					<th>
						<div class="th_content">{head[i].name}</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each body as row (row)}
				<tr>
					{#each visibleIndices as i}
						{#if row[i].type === 'image' && typeof row[i].content === 'string'}
							<td>
								<a href={row[i].link}>
									<img src={row[i].content} alt={row[i].alt} />
								</a>
							</td>
						{:else if row[i].type === 'string'}
							<td class="ellipsis allow-select">
								<a href={row[i].link}>
									{row[i].content}
								</a>
							</td>
						{:else if row[i].type === 'switch' && typeof row[i].content === 'boolean' && row[i].callback}
							<td class="center-align">
								<Switch bind:state={row[i].content} callback={row[i].callback} />
							</td>
						{:else if row[i].type === 'badgeArray' && typeof row[i].content === 'object'}
							<td class="ellipsis">
								{#each row[i].content as item}
									<Badge badge={item} />
								{/each}
							</td>
						{:else if row[i].type === 'link' && typeof row[i].content === 'string'}
							<td class="center-align">
								<a
									class="action-button edit-button"
									href={row[i].link}
									aria-label={row[i].alt}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
									>
										<path d={row[i].content} />
									</svg>
								</a>
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	div {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	table {
		width: 100%;
		max-width: 100%;
		border-collapse: collapse;
		table-layout: auto;
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

	th {
		padding: 0 0.2rem;
	}

	th:first-of-type {
		padding-left: 0;
	}

	th:last-of-type {
		padding-right: 0;
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
		max-width: min(200px, 33vw);
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
