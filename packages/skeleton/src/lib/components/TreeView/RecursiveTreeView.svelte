<script lang="ts">
	import { untrack } from 'svelte';
	import { setContext } from 'svelte';

	// Types
	import type { CssClasses, TreeViewNode } from '../../index.js';
	import RecursiveTreeViewItem from './RecursiveTreeViewItem.svelte';

	// Props A11y

	interface Props {
		class?: string;
		onclick?: ((event: { id: string }) => void) | undefined;
		ontoggle?: ((event: { id: string }) => void) | undefined;
		/** Enable tree-view selection. */
		selection?: boolean;
		/** Enable selection of multiple items. */
		multiple?: boolean;
		/** Enable relational checking. */
		relational?: boolean;
		/** Provide data-driven nodes. */
		nodes?: TreeViewNode[];
		/** provides id's of expanded nodes */
		expandedNodes?: string[];
		/** provides id's of disabled nodes */
		disabledNodes?: string[];
		/** provides id's of checked nodes */
		checkedNodes?: string[];
		/** provides id's of indeterminate nodes */
		indeterminateNodes?: string[];
		/** Provide classes to set the tree width. */
		width?: CssClasses;
		/** Provide classes to set the vertical spacing between items. */
		spacing?: CssClasses;
		/** Provide classes to set the tree item padding styles. */
		padding?: CssClasses;
		/** Provide classes to set the tree children indentation */
		indent?: CssClasses;
		/** Provide classes to set the tree item hover styles. */
		hover?: CssClasses;
		/** Provide classes to set the tree item rounded styles. */
		rounded?: CssClasses;
		/** Set the rotation of the item caret in the open state. */
		caretOpen?: CssClasses;
		/** Set the rotation of the item caret in the closed state. */
		caretClosed?: CssClasses;
		/* Set the hyphen symbol opacity for non-expandable rows. */
		hyphenOpacity?: CssClasses;
		/** Provide arbitrary classes to the tree item summary region. */
		regionSummary?: CssClasses;
		/** Provide arbitrary classes to the symbol icon region. */
		regionSymbol?: CssClasses;
		/** Provide arbitrary classes to the children region. */
		regionChildren?: CssClasses;
		/** Provide the ARIA labelledby value. */
		labelledby?: string;
	}

	let {
		class: className = '',
		onclick = undefined,
		ontoggle = undefined,
		selection = false,
		multiple = false,
		relational = false,
		nodes = [],
		expandedNodes = $bindable([]),
		disabledNodes = $bindable([]),
		checkedNodes = $bindable([]),
		indeterminateNodes = $bindable([]),
		width = 'w-full',
		spacing = 'space-y-1',
		padding = 'py-4 px-4',
		indent = 'ml-4',
		hover = 'hover:variant-soft',
		rounded = 'rounded-container-token',
		caretOpen = 'rotate-180',
		caretClosed = '',
		hyphenOpacity = 'opacity-10',
		regionSummary = '',
		regionSymbol = '',
		regionChildren = '',
		labelledby = ''
	}: Props = $props();

	// Context API
	untrack(() => setContext('selection', selection));
	untrack(() => setContext('multiple', multiple));
	untrack(() => setContext('relational', relational));
	untrack(() => setContext('padding', padding));
	untrack(() => setContext('indent', indent));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('rounded', rounded));
	untrack(() => setContext('caretOpen', caretOpen));
	untrack(() => setContext('caretClosed', caretClosed));
	untrack(() => setContext('hyphenOpacity', hyphenOpacity));
	untrack(() => setContext('regionSummary', regionSummary));
	untrack(() => setContext('regionSymbol', regionSymbol));
	untrack(() => setContext('regionChildren', regionChildren));

	// events

	function onClick(event: { id: string }) {
		/** @event {{id:string}} click - Fires on tree item click */
		onclick?.({
			id: event.id
		});
	}

	function onToggle(event: { id: string }) {
		/** @event {{id:string}} toggle - Fires on tree item toggle */
		ontoggle?.({
			id: event.id
		});
	}

	// Reactive
	let classesBase = $derived(`${width} ${spacing} ${className ?? ''}`);
</script>

<div class="tree {classesBase}" data-testid="tree" role="tree" aria-multiselectable={multiple} aria-label={labelledby}>
	{#if nodes && nodes.length > 0}
		<RecursiveTreeViewItem
			{nodes}
			bind:expandedNodes
			bind:disabledNodes
			bind:checkedNodes
			bind:indeterminateNodes
			onclick={onClick}
			ontoggle={onToggle}
		/>
	{/if}
</div>
