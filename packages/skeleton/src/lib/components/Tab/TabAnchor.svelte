<script lang="ts">
	// Slots
	/** @slot lead - Provides a leading position, which can be used for icons. */

	import { getContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Context

	interface Props {
		class?: string;
		href?: string;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onmouseover?: ((event: MouseEvent) => void) | undefined;
		onmouseleave?: ((event: MouseEvent) => void) | undefined;
		onfocus?: ((event: FocusEvent) => void) | undefined;
		onblur?: ((event: FocusEvent) => void) | undefined;
		/** Enables the active state styles when set true. */
		selected?: boolean;
		/** Set the ARIA controls value to define which panel this tab controls. */
		controls?: string;
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
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		href: hrefAttribute = '',
		onclick = undefined,
		onkeydown = undefined,
		onkeyup = undefined,
		onkeypress = undefined,
		onmouseover = undefined,
		onmouseleave = undefined,
		onfocus = undefined,
		onblur = undefined,
		selected = false,
		controls = '',
		active = getContext<NonNullable<Props['active']>>('active'),
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		flex = getContext<NonNullable<Props['flex']>>('flex'),
		padding = getContext<NonNullable<Props['padding']>>('padding'),
		rounded = getContext<NonNullable<Props['rounded']>>('rounded'),
		spacing = getContext<NonNullable<Props['spacing']>>('spacing'),
		lead,
		children,
		...rest
	}: Props = $props();

	// Classes
	const cBase = 'text-center cursor-pointer transition-colors duration-100';
	const cInterface = '';

	// State
	let classesActive = $derived(selected ? active : hover);
	let classesBase = $derived(`${cBase} ${flex} ${padding} ${rounded} ${classesActive} ${className ?? ''}`);
	let classesInterface = $derived(`${cInterface} ${spacing}`);

	// RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<a
	class="tab-anchor {classesBase}"
	href={hrefAttribute}
	{...prunedRestProps()}
	aria-controls={controls}
	role="button"
	onclick={(event) => onclick?.(event)}
	onkeydown={(event) => onkeydown?.(event)}
	onkeyup={(event) => onkeyup?.(event)}
	onkeypress={(event) => onkeypress?.(event)}
	onmouseover={(event) => onmouseover?.(event)}
	onmouseleave={(event) => onmouseleave?.(event)}
	onfocus={(event) => onfocus?.(event)}
	onblur={(event) => onblur?.(event)}
	data-testid="tab-anchor"
>
	<!-- Interface -->
	<div class="tab-interface {classesInterface}">
		{#if lead}<div class="tab-lead">{@render lead?.()}</div>{/if}
		<div class="tab-label">{@render children?.()}</div>
	</div>
</a>
