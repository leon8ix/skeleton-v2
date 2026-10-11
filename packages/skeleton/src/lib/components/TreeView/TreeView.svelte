<script lang="ts">
	import { untrack } from 'svelte';
	import { setContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props A11y

	interface Props {
		class?: string;
		/** Enable tree-view selection. */
		selection?: boolean;
		/** Enable selection of multiple items. */
		multiple?: boolean;
		/** Provide classes to set the tree width. */
		width?: CssClasses;
		/** Provide classes to set the vertical spacing between items. */
		spacing?: CssClasses;
		/** Set open by default on load. */
		open?: boolean;
		/** Set the tree disabled state */
		disabled?: boolean;
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
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		selection = false,
		multiple = false,
		width = 'w-full',
		spacing = 'space-y-1',
		open = false,
		disabled = false,
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
		labelledby = '',
		children
	}: Props = $props();

	// Functionality
	/** expands all tree view items. */
	export function expandAll(): void {
		if (!tree) return;
		const detailsElements = tree.querySelectorAll<HTMLDetailsElement>('details.tree-item');
		detailsElements.forEach((details) => {
			if (!details.open) {
				const summary = details.querySelector<HTMLElement>('summary.tree-item-summary');
				if (summary) summary.click();
			}
		});
	}
	/** collapses all tree view items. */
	export function collapseAll(): void {
		if (!tree) return;
		const detailsElements = tree.querySelectorAll<HTMLDetailsElement>('details.tree-item');
		detailsElements.forEach((details) => {
			if (details.open) {
				const summary = details.querySelector<HTMLElement>('summary.tree-item-summary');
				if (summary) summary.click();
			}
		});
	}

	// Context API
	untrack(() => setContext('open', open));
	untrack(() => setContext('selection', selection));
	untrack(() => setContext('multiple', multiple));
	untrack(() => setContext('disabled', disabled));
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

	// Reactive
	let classesBase = $derived(`${width} ${spacing} ${className ?? ''}`);

	// Locals
	let tree = $state<HTMLDivElement>();
</script>

<div
	bind:this={tree}
	class="tree {classesBase}"
	data-testid="tree"
	role="tree"
	aria-multiselectable={multiple}
	aria-label={labelledby}
	aria-disabled={disabled}
>
	{@render children?.()}
</div>
