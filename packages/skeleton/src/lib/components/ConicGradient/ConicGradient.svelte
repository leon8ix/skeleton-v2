<script lang="ts">
	import { tailwindDefaultColors } from './settings.js';

	// Types
	import type { CssClasses } from '../../index.js';
	import type { ConicStop } from './types.js';

	// Props (regions)

	interface Props {
		class?: string;
		/** Provide a data set of color stops and labels. */
		stops?: ConicStop[];
		/** Enable a contextual legend. */
		legend?: boolean;
		/** When enabled, the conic gradient will spin. */
		spin?: boolean;
		/** Style the conic gradient width. */
		width?: CssClasses;
		/** Style the legend hover effect. */
		hover?: CssClasses;
		/** Set the number of digits on the legend values. */
		digits?: number;
		/** Style the caption region above the gradient. */
		regionCaption?: CssClasses;
		/** Style the conic gradient region. */
		regionCone?: CssClasses;
		/** Style the legend region below the gradient. */
		regionLegend?: CssClasses;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		stops = [{ color: ['neutral', 500], start: 0, end: 100 }],
		legend = false,
		spin = false,
		width = 'w-24',
		hover = 'bg-primary-hover-token',
		digits = 0,
		regionCaption = '',
		regionCone = '',
		regionLegend = '',
		children
	}: Props = $props();

	// Local

	// Styles
	const cBase = 'flex flex-col items-center space-y-4 w-';
	const cCaption = 'text-center';
	const cCone = 'block aspect-square rounded-full';
	const cLegend = 'text-sm w-full';
	const cSwatch = 'block aspect-square bg-black w-5 rounded-full mr-2';

	// Set Color
	function setColorValue(color: any): string {
		// If string, keep as is
		if (typeof color === 'string') return color;
		// If object, provide default Tailwind color
		const colorSet: any = tailwindDefaultColors.find((c) => c.label === color[0]);
		return colorSet?.shades[color[1]].hex;
	}

	let cone = $derived('conic-gradient(' + stops.map((v) => `${setColorValue(v.color)} ${v.start}% ${v.end}%`).join(', ') + ')');
	let generatedLegendList = $derived(
		legend ? stops.map((v) => ({ label: v.label, color: setColorValue(v.color), value: (v.end - v.start).toFixed(digits) })) : []
	);
	// Reactive
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesCaption = $derived(`${cCaption} ${regionCaption}`);
	let classesCone = $derived(`${cCone} ${width} ${regionCone}`);
	let classesLegend = $derived(`${cLegend} ${regionLegend}`);
</script>

<figure class="conic-gradient {classesBase}" data-testid="conic-gradient">
	<!-- Label -->
	{#if children}
		<figcaption class="conic-caption {classesCaption}">{@render children?.()}</figcaption>
	{/if}
	<!-- Conic Gradient -->
	{#if cone}
		<div class="conic-cone {classesCone}" class:animate-spin={spin} style:background={cone}></div>
	{/if}
	<!-- Legend -->
	{#if legend && generatedLegendList}
		<ul class="conic-list list {classesLegend}">
			{#each generatedLegendList as { color, label, value }}
				<li class="conic-item {hover}">
					<span class="conic-swatch {cSwatch}" style:background={color}></span>
					<span class="conic-label flex-auto">{label}</span>
					<strong class="conic-value">{value}%</strong>
				</li>
			{/each}
		</ul>
	{/if}
</figure>
