<script lang="ts">
	import { untrack } from 'svelte';
	// Slots
	/** @slot lead - Provides content at the top of the rail, e.g. a logo. @slot trail - Provides content at the bottom of the rail, e.g. account. */

	import { setContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (tiles/anchors)

	interface Props {
		class?: string;
		/** Rail: Provide classes to set the background color. */
		background?: CssClasses;
		/** Rail: Provide classes to set the border color. */
		border?: CssClasses;
		/** Rail: Provide classes to set the width. */
		width?: CssClasses;
		/** Rail: Provide classes to set the height. */
		height?: CssClasses;
		/** Rail: Provide a class to set the grid gap. */
		gap?: CssClasses;
		/** Rail: Provide arbitrary classes to the lead region. */
		regionLead?: CssClasses;
		/** Rail: Provide arbitrary classes to the default region. */
		regionDefault?: CssClasses;
		/** Rail: Provide arbitrary classes to the trail region. */
		regionTrail?: CssClasses;
		/** Provide classes to set the tile/anchor hover background color. */
		hover?: CssClasses;
		/** Provide classes to set the tile/anchor active tile background. */
		active?: CssClasses;
		/** Provide classes to set the tile/anchor vertical spacing. */
		spacing?: CssClasses;
		/** Provide classes to set the tile/anchor aspect ratio. */
		aspectRatio?: CssClasses;
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		trail?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		background = 'bg-surface-100-800-token',
		border = '',
		width = 'w-20',
		height = 'h-full',
		gap = 'gap-0',
		regionLead = '',
		regionDefault = '',
		regionTrail = '',
		hover = 'bg-primary-hover-token',
		active = 'bg-primary-active-token',
		spacing = 'space-y-1',
		aspectRatio = 'aspect-square',
		lead,
		children,
		trail
	}: Props = $props();

	// Context
	untrack(() => setContext('active', active));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('spacing', spacing));
	untrack(() => setContext('aspectRatio', aspectRatio));

	// Base Classes
	const cBase = 'grid grid-rows-[auto_1fr_auto] overflow-y-auto';
	const cRegionLead = 'box-border';
	const cRegionDefault = 'box-border';
	const cRegionTrail = 'box-border';

	// Reactive
	let classesBase = $derived(`${cBase} ${background} ${border} ${width} ${height} ${gap} ${className || ''}`);
	let classesRegionLead = $derived(`${cRegionLead} ${regionLead}`);
	let classesRegionDefault = $derived(`${cRegionDefault} ${regionDefault}`);
	let classesRegionTrail = $derived(`${cRegionTrail} ${regionTrail}`);
</script>

<!-- @component A vertical navigation rail component. -->

<div class="app-rail {classesBase}" data-testid="app-rail">
	<!-- Slot: lead -->
	<div class="app-bar-lead {classesRegionLead}">{@render lead?.()}</div>
	<!-- Slot: Default -->
	<div class="app-bar-default {classesRegionDefault}">{@render children?.()}</div>
	<!-- Slot: lead -->
	<div class="app-bar-trail {classesRegionTrail}">{@render trail?.()}</div>
</div>
