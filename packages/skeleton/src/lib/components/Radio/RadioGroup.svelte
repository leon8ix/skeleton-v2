<script lang="ts">
	import { untrack } from 'svelte';
	import { setContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (a11y)

	interface Props {
		class?: string;
		/** Provide display classes. Use `flex` to stretch full width. */
		display?: CssClasses;
		/** Provide classes to set flex-direction. Use `flex-col` for vertical layout. */
		flexDirection?: CssClasses;
		/** Provide classes to set gap spacing between items. */
		gap?: CssClasses;
		/** Provide classes to set the base background color. */
		background?: CssClasses;
		/** Provide classes to set the border styles. */
		border?: CssClasses;
		/** Provide classes to set the border radius. */
		rounded?: CssClasses;
		/** Provide classes to set the RadioItem padding. */
		padding?: CssClasses;
		/** Provide classes to set the active item color. */
		active?: CssClasses;
		/** Provide classes to set the hover style. */
		hover?: CssClasses;
		/** Provide classes to set the highlighted text color. */
		color?: CssClasses;
		/** Provide classes to set the highlighted SVG fill color. */
		fill?: CssClasses;
		/** Provide classes for the label region. */
		regionLabel?: CssClasses;
		/** Provide the ARIA labelledby value. */
		labelledby?: string;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		display = 'inline-flex',
		flexDirection = 'flex-row',
		gap = 'gap-1',
		background = 'bg-surface-200-700-token',
		border = 'border-token border-surface-400-500-token',
		rounded = 'rounded-token',
		padding = 'px-4 py-1',
		active = 'variant-filled',
		hover = 'hover:variant-soft',
		color = '',
		fill = '',
		regionLabel = '',
		labelledby = '',
		children
	}: Props = $props();

	// Context
	untrack(() => setContext('rounded', rounded));
	untrack(() => setContext('padding', padding));
	untrack(() => setContext('active', active));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('color', color));
	untrack(() => setContext('fill', fill));
	untrack(() => setContext('regionLabel', regionLabel));

	// Classes
	const cBase = 'p-1';

	// Reactive
	let classesBase = $derived(`${cBase} ${display} ${flexDirection} ${gap} ${background} ${border} ${rounded} ${className ?? ''}`);
</script>

<div class="radio-group {classesBase}" data-testid="radio-group" role="radiogroup" aria-labelledby={labelledby}>
	{@render children?.()}
</div>
