<script lang="ts">
	// Slots
	/** @slot lead - Provides content on the left end of the bar, e.g. a logo. @slot trail - Provides content on the right end of the bar, e.g. navigation elements. */

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (a11y)

	interface Props {
		class?: string;
		/** Provide classes to set background color. */
		background?: CssClasses;
		/** Provide classes to set border styles. */
		border?: CssClasses;
		/** Provide classes to set padding. */
		padding?: CssClasses;
		/** Provide classes to define a box shadow. */
		shadow?: CssClasses;
		/** Provide classes to set the vertical spacing between rows. */
		spacing?: CssClasses;
		/** Provide classes to set grid columns for the main row. */
		gridColumns?: CssClasses;
		/** Provide classes to set gap spacing for the main row. */
		gap?: CssClasses;
		/** Provide arbitrary classes to style the top (main) row. */
		regionRowMain?: CssClasses;
		/** Provide arbitrary classes to style the bottom (headline) row. */
		regionRowHeadline?: CssClasses;
		/** Classes to apply to the lead slot container element */
		slotLead?: CssClasses;
		/** Classes to apply to the default slot container element */
		slotDefault?: CssClasses;
		/** Classes to apply to the trail slot container element */
		slotTrail?: CssClasses;
		/** Provide a semantic ID for the ARIA label. */
		label?: string;
		/** Provide the ID of the element that labels the toolbar. */
		labelledby?: string;
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		trail?: import('svelte').Snippet;
		headline?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		background = 'bg-surface-100-800-token',
		border = '',
		padding = 'p-4',
		shadow = '',
		spacing = 'space-y-4',
		gridColumns = 'grid-cols-[auto_1fr_auto]',
		gap = 'gap-4',
		regionRowMain = '',
		regionRowHeadline = '',
		slotLead = '',
		slotDefault = '',
		slotTrail = '',
		label = '',
		labelledby = '',
		lead,
		children,
		trail,
		headline
	}: Props = $props();

	// Base Classes
	const cBase = 'flex flex-col';
	// ---
	const cRowMain = 'grid items-center'; //  bg-blue-500
	const cRowHeadline = ''; //  bg-green-500
	// ---
	const cSlotLead = 'flex-none flex justify-between items-center';
	const cSlotDefault = 'flex-auto';
	const cSlotTrail = 'flex-none flex items-center space-x-4';

	// Reactive Classes
	let classesBase = $derived(`${cBase} ${background} ${border} ${spacing} ${padding} ${shadow} ${className ?? ''}`);
	let classesRowMain = $derived(`${cRowMain} ${gridColumns} ${gap} ${regionRowMain}`);
	let classesRowHeadline = $derived(`${cRowHeadline} ${regionRowHeadline}`);
	let classesSlotLead = $derived(`${cSlotLead} ${slotLead}`); // bg-red-500
	let classesSlotDefault = $derived(`${cSlotDefault} ${slotDefault}`); // bg-blue-500
	let classesSlotTrail = $derived(`${cSlotTrail} ${slotTrail}`); // bg-green-500
</script>

<div class="app-bar {classesBase}" data-testid="app-bar" role="toolbar" aria-label={label} aria-labelledby={labelledby}>
	<!-- Row: Main -->
	<div class="app-bar-row-main {classesRowMain}">
		<!-- Slot: lead -->
		{#if lead}
			<div class="app-bar-slot-lead {classesSlotLead}">{@render lead?.()}</div>
		{/if}
		<!-- Slot: default -->
		<div class="app-bar-slot-default {classesSlotDefault}">{@render children?.()}</div>
		<!-- Slot: trail -->
		{#if trail}
			<div class="app-bar-slot-trail {classesSlotTrail}">{@render trail?.()}</div>
		{/if}
	</div>
	<!-- Row: Headline -->
	{#if headline}
		<div class="app-bar-row-headline {classesRowHeadline}">{@render headline?.()}</div>
	{/if}
</div>
