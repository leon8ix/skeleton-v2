<script lang="ts">
	import { untrack } from 'svelte';
	import { setContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (a11y)

	interface Props {
		class?: string;
		/** Enable selection of multiple items. */
		multiple?: boolean;
		/** Disables selection of items. */
		disabled?: boolean;
		/** Provide class to set the vertical spacing style. */
		spacing?: CssClasses;
		/** Provide classes to set the listbox box radius styles. */
		rounded?: CssClasses;
		/** Provide classes to set the listbox item active background styles. */
		active?: CssClasses;
		/** Provide classes to set the listbox item hover background styles. */
		hover?: CssClasses;
		/** Provide classes to set the listbox item padding styles. */
		padding?: CssClasses;
		/** Provide arbitrary classes to style the lead region. */
		regionLead?: CssClasses;
		/** Provide arbitrary classes to the default region. */
		regionDefault?: CssClasses;
		/** Provide arbitrary classes to the trail region. */
		regionTrail?: CssClasses;
		/** Provide the ARIA labelledby value. */
		labelledby?: string;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		multiple = false,
		disabled = false,
		spacing = 'space-y-1',
		rounded = 'rounded-token',
		active = 'variant-filled',
		hover = 'hover:variant-soft',
		padding = 'px-4 py-2',
		regionLead = '',
		regionDefault = '',
		regionTrail = '',
		labelledby = '',
		children
	}: Props = $props();

	// Context
	untrack(() => setContext('disabled', disabled));
	untrack(() => setContext('multiple', multiple));
	untrack(() => setContext('rounded', rounded));
	untrack(() => setContext('active', active));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('padding', padding));
	untrack(() => setContext('regionLead', regionLead));
	untrack(() => setContext('regionDefault', regionDefault));
	untrack(() => setContext('regionTrail', regionTrail));

	// Classes
	const cBase = '';

	// Reactive
	let classesBase = $derived(`${cBase} ${spacing} ${rounded} ${className ?? ''}`);
</script>

<div class="listbox {classesBase}" role="listbox" aria-labelledby={labelledby} data-testid="listbox">
	{@render children?.()}
</div>
