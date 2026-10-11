<script lang="ts">
	// Types
	import type { CssClasses } from '../../index.js';
	import type { Action } from 'svelte/action';

	// Props (styles)

	interface Props {
		class?: string;
		style?: string;
		alt?: string;
		/** Initials only - Provide up to two text characters. */
		initials?: string;
		/** Initials only - Provide classes to set the SVG text fill color. */
		fill?: CssClasses;
		/** Initials only - Set the base font size for the scalable SVG text. */
		fontSize?: number;
		/** Provide the avatar image element source. */
		src?: string;
		/** Provide the fallback image element source. */
		fallback?: string;
		/** Image only. Provide a Svelte action reference, such as `filter`. */
		action?: Action<HTMLElement, string>;
		/** Image only. Provide Svelte action params, such as Apollo. */
		actionParams?: string;
		/** Provide classes to set background styles. */
		background?: CssClasses;
		/** Provide classes to set avatar width. */
		width?: CssClasses;
		/** Provide classes to set border styles. */
		border?: CssClasses;
		/** Provide classes to set rounded style. */
		rounded?: CssClasses;
		/** Provide classes to set shadow styles. */
		shadow?: CssClasses;
		/** Provide classes to set cursor styles. */
		cursor?: CssClasses;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		style: styleAttribute = '',
		alt: altAttribute = '',
		initials = '',
		fill = 'fill-token',
		fontSize = 150,
		src = $bindable(''),
		fallback = '',
		action = () => {},
		actionParams = '',
		background = 'bg-surface-400-500-token',
		width = 'w-16',
		border = '',
		rounded = 'rounded-full',
		shadow = '',
		cursor = '',
		children,
		...rest
	}: Props = $props();

	// Base Classes
	let cBase = 'flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate';
	let cImage = 'w-full object-cover';

	// Reactive Classes
	let classesBase = $derived(`${cBase} ${background} ${width} ${border} ${rounded} ${shadow} ${cursor} ${className ?? ''}`);

	// Utility Functions
	function prunedRestProps() {
		return rest;
	}
</script>

<figure class="avatar {classesBase}" data-testid="avatar" {...prunedRestProps()}>
	{#if src || fallback}
		<img
			class="avatar-image {cImage}"
			style={styleAttribute ?? ''}
			{src}
			alt={altAttribute || ''}
			use:action={actionParams}
			onerror={() => (src = fallback)}
		/>
	{:else if initials}
		<svg class="avatar-initials w-full h-full" viewBox="0 0 512 512">
			<text
				x="50%"
				y="50%"
				dominant-baseline="central"
				text-anchor="middle"
				font-weight="bold"
				font-size={fontSize}
				class="avatar-text {fill}"
			>
				{String(initials).substring(0, 2).toUpperCase()}
			</text>
		</svg>
	{:else}
		{@render children?.()}
	{/if}
</figure>
