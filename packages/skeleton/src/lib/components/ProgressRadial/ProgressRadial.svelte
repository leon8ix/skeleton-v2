<!-- Reference: https://css-tricks.com/building-progress-ring-quickly/ -->
<script lang="ts">
	// Types
	import type { CssClasses } from '../../index.js';

	// Props A11y

	interface Props {
		class?: string;
		/** Set the meter fill amount. Shows as indeterminate when set `undefined`. */
		value?: number | undefined; // %
		/** Sets the base stroke width. Scales responsively. */
		stroke?: number; // px
		/** Sets the base font size. Scales responsively. */
		font?: number; // px
		/** Sets the stoke-linecap value */
		strokeLinecap?: 'butt' | 'round' | 'square';
		/** Provide classes to set the meter transition styles. */
		transition?: CssClasses;
		/** Provide classes to set the width. */
		width?: CssClasses;
		/** Provide classes to set meter color. */
		meter?: CssClasses;
		/** Provide classes to set track color. */
		track?: CssClasses;
		/** Provide classes to set the SVG text fill color. */
		fill?: CssClasses;
		/** Provide the ARIA labelledby value. */
		labelledby?: string;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		value = undefined,
		stroke = 40,
		font = 56,
		strokeLinecap = 'butt',
		transition = 'transition-[stroke-dashoffset]',
		width = 'w-36',
		meter = 'stroke-surface-900 dark:stroke-surface-50',
		track = 'stroke-surface-500/30',
		fill = 'fill-token',
		labelledby = '',
		children
	}: Props = $props();

	// Base Classes
	const cBase = 'progress-radial relative overflow-hidden';
	const cBaseTrack = 'fill-transparent';
	const cBaseMeter = 'fill-transparent -rotate-90 origin-[50%_50%]';

	// Calculated Values
	const baseSize = 512; // px
	let radius = $derived(baseSize / 2 - stroke / 2);
	let circumference = $derived(radius * 2 * Math.PI);
	let dashoffset = $derived(circumference - ((value ?? 25) / 100) * circumference);
	let classesBase = $derived(`${cBase} ${width} ${className ?? ''}`);
</script>

<figure
	class="progress-radial {classesBase}"
	data-testid="progress-radial"
	role="meter"
	aria-labelledby={labelledby}
	aria-valuenow={value || 0}
	aria-valuetext={value ? `${value}%` : 'Indeterminate Spinner'}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<!-- Draw SVG -->
	<svg viewBox="0 0 {baseSize} {baseSize}" class="rounded-full" class:animate-spin={value === undefined}>
		<!-- Track -->
		<circle class="progress-radial-track {cBaseTrack} {track}" stroke-width={stroke} r={radius} cx="50%" cy="50%" />

		<!-- Meter -->
		<circle
			class="progress-radial-meter {cBaseMeter} {meter} {transition}"
			stroke-width={stroke}
			r={radius}
			cx="50%"
			cy="50%"
			style:stroke-dasharray="{circumference}
			{circumference}"
			style:stroke-dashoffset={dashoffset}
			stroke-linecap={strokeLinecap}
		/>

		<!-- Center Text -->
		{#if value != undefined && value >= 0 && children}
			<text
				x="50%"
				y="50%"
				text-anchor="middle"
				dominant-baseline="middle"
				font-weight="bold"
				font-size={font}
				class="progress-radial-text {fill}">{@render children?.()}</text
			>
		{/if}
	</svg>
</figure>
