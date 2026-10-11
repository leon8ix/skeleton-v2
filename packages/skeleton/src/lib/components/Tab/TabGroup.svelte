<script lang="ts">
	import { untrack } from 'svelte';
	// Slots
	/** @slot panel - An optional region to house tab content. */

	import { setContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (a11y)

	interface Props {
		class?: string;
		/** Provide classes to set the tab list flex justification. */
		justify?: CssClasses;
		/** Provide classes to set the tab group border styles. */
		border?: CssClasses;
		/** Provide classes to style each tab's active styles. */
		active?: CssClasses;
		/** Provide classes to style each tab's hover styles. */
		hover?: CssClasses;
		/** Provide classes to style each tab's flex styles. */
		flex?: CssClasses;
		/** Provide classes to style each tab's padding styles. */
		padding?: CssClasses;
		/** Provide classes to style each tab's box radius styles. */
		rounded?: CssClasses;
		/** Provide classes to set the vertical spacing between items. */
		spacing?: CssClasses;
		/** Provide arbitrary classes to style the tab list region. */
		regionList?: CssClasses;
		/** Provide arbitrary classes to style the tab panel region. */
		regionPanel?: CssClasses;
		/** Provide the ID of the element that labels the tab list. */
		labelledby?: string;
		/** Matches the tab aria-control value, pairs with the panel. */
		panel?: string;
		children?: import('svelte').Snippet;
		panelContent?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		justify = 'justify-start',
		border = 'border-b border-surface-400-500-token',
		active = 'border-b-2 border-surface-900-50-token',
		hover = 'hover:variant-soft',
		flex = 'flex-none',
		padding = 'px-4 py-2',
		rounded = 'rounded-tl-container-token rounded-tr-container-token',
		spacing = 'space-y-1',
		regionList = '',
		regionPanel = '',
		labelledby = '',
		panel = '',
		children,
		panelContent
	}: Props = $props();

	// Context
	untrack(() => setContext('active', active));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('flex', flex));
	untrack(() => setContext('padding', padding));
	untrack(() => setContext('rounded', rounded));
	untrack(() => setContext('spacing', spacing));

	// Classes
	const cBase = 'space-y-4';
	const cList = 'flex overflow-x-auto hide-scrollbar';
	const cPanel = '';

	// Reactive
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesList = $derived(`${cList} ${justify} ${border} ${regionList}`);
	let classesPanel = $derived(`${cPanel} ${regionPanel}`);
</script>

<div class="tab-group {classesBase}" data-testid="tab-group">
	<!-- Tab List -->
	<div class="tab-list {classesList}" role="tablist" aria-labelledby={labelledby}>
		{@render children?.()}
	</div>
	<!-- Tab Panel -->
	{#if panelContent}
		<div class="tab-panel {classesPanel}" role="tabpanel" aria-labelledby={panel} tabindex="0">
			{@render panelContent?.()}
		</div>
	{/if}
</div>
