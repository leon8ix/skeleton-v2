<script lang="ts">
	import { tableA11y } from './actions.js';

	// Types
	import type { CssClasses, SvelteEvent, TableSource } from '../../index.js';

	// Event Dispatcher
	type TableEvent = {
		selected: string[];
	};

	// Props (styles)

	interface Props {
		class?: string;
		onselected?: ((event: TableEvent['selected']) => void) | undefined;
		/** Provide the full set of table source data. */
		source: TableSource;
		/** Enables row hover style and `on:selected` event when rows are clicked. */
		interactive?: boolean;
		/** Override the Tailwind Element class. Replace this for a headless UI. */
		element?: CssClasses;
		/** Provide classes to set the table text size. */
		text?: CssClasses;
		/** Provide classes to set the table text color. */
		color?: CssClasses;
		/** Provide arbitrary classes for the table head. */
		regionHead?: CssClasses;
		/** Provide arbitrary classes for the table head cells. */
		regionHeadCell?: CssClasses;
		/** Provide arbitrary classes for the table body. */
		regionBody?: CssClasses;
		/** Provide arbitrary classes for the table cells. */
		regionCell?: CssClasses;
		/** Provide arbitrary classes for the table foot. */
		regionFoot?: CssClasses;
		/** Provide arbitrary classes for the table foot cells. */
		regionFootCell?: CssClasses;
	}

	let {
		class: className = '',
		onselected = undefined,
		source,
		interactive = false,
		element = 'table',
		text = '',
		color = '',
		regionHead = '',
		regionHeadCell = '',
		regionBody = '',
		regionCell = '',
		regionFoot = '',
		regionFootCell = ''
	}: Props = $props();

	// Row Click Handler
	function onRowClick(event: SvelteEvent<MouseEvent | KeyboardEvent, HTMLTableRowElement>, rowIndex: number): void {
		if (!interactive) return;
		event.preventDefault();
		event.stopPropagation();
		// Prefer meta row info if available, else fallback to body row info
		const rowMetaData = source.meta ? source.meta[rowIndex] : source.body[rowIndex];
		/** @event {rowMetaData} selected - Fires when a table row is clicked. */
		onselected?.(rowMetaData);
	}

	// Row Keydown Handler
	function onRowKeydown(event: SvelteEvent<KeyboardEvent, HTMLTableRowElement>, rowIndex: number): void {
		if (['Enter', 'Space'].includes(event.code)) onRowClick(event, rowIndex);
	}

	// Reactive
	let classesBase = $derived(`${className || ''}`);
	let classesTable = $derived(`${element} ${text} ${color}`);
</script>

<div class="table-container {classesBase}">
	<!-- Table -->
	<!-- prettier-ignore -->
	<table
		class="{classesTable}"
		class:table-interactive={interactive}
		role={interactive ? "grid" : "table"}
		use:tableA11y
	>
		<!-- on:keydown={(e) => onTableKeydown(elemTable, e)} -->
		<!-- Head -->
		<thead class="table-head {regionHead}">
			<tr>
				{#each source.head as heading }
					<th class="{regionHeadCell}" role="columnheader">{@html heading}</th>
				{/each}
			</tr>
		</thead>
		<!-- Body -->
		<tbody class="table-body {regionBody}">
			{#each source.body as row, rowIndex}
				<!-- Row -->
				<!-- prettier-ignore -->
				<tr
					onclick={(e) => { onRowClick(e, rowIndex); }}
					onkeydown={(e) => { onRowKeydown(e, rowIndex); }}
					aria-rowindex={rowIndex + 1}
				>
					{#each row as cell, cellIndex}
						<!-- Cell -->
						<td
							class="{regionCell}"
							role="gridcell"
							aria-colindex={cellIndex + 1}
							tabindex={cellIndex === 0 && interactive ? 0 : -1}
						>
							{@html Number(cell) === 0 ? cell : (cell ? cell : '-')}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<!-- Foot -->
		{#if source.foot}
			<tfoot class="table-foot {regionFoot}">
				<tr>
					{#each source.foot as cell }
						<td class="{regionFootCell}">{@html cell}</td>
					{/each}
				</tr>
			</tfoot>
		{/if}
	</table>
</div>
