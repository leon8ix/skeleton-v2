<script lang="ts">
	// Slots
	/** @slot lead - Appears above the default label, useful for icons. */

	import { getContext } from 'svelte';

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (region)

	interface Props {
		class?: string;
		href?: string;
		onclick?: ((event: MouseEvent) => void) | undefined;
		/** Enables the active state styles when set true. */
		selected?: boolean;
		/** Provide arbitrary classes to style the lead region. */
		regionLead?: CssClasses;
		/** Provide arbitrary classes to style the label region. */
		regionLabel?: CssClasses;
		// Context
		hover?: CssClasses;
		active?: CssClasses;
		spacing?: CssClasses;
		aspectRatio?: CssClasses;
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		href: hrefAttribute = '',
		onclick = undefined,
		selected = false,
		regionLead = 'flex justify-center items-center',
		regionLabel = '',
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		active = getContext<NonNullable<Props['active']>>('active'),
		spacing = getContext<NonNullable<Props['spacing']>>('spacing'),
		aspectRatio = getContext<NonNullable<Props['aspectRatio']>>('aspectRatio'),
		lead,
		children,
		...rest
	}: Props = $props();

	// Classes
	const cBase = 'unstyled';
	const cWrapper = 'w-full flex flex-col justify-center items-stretch text-center space-y-1'; // CHRIS: keep `w-full` here please
	const cLabel = 'font-bold text-xs';

	// State
	let classActive = $derived(selected ? active : '');
	// Reactive
	let classesBase = $derived(`${cBase} ${className || ''}`);
	let classesWrapper = $derived(`${cWrapper} ${aspectRatio} ${hover} ${spacing} ${classActive}`);
	let classesLead = $derived(`${regionLead}`);
	let classesLabel = $derived(`${cLabel} ${regionLabel}`);

	// RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<a
	class="app-rail-anchor {classesBase}"
	href={hrefAttribute}
	{...prunedRestProps()}
	data-testid="app-rail-anchor"
	onclick={(event) => onclick?.(event)}
>
	<div class="app-rail-wrapper {classesWrapper}">
		{#if lead}<div class="app-rail-lead {classesLead}">{@render lead?.()}</div>{/if}
		<div class="app-rail-label {classesLabel}">{@render children?.()}</div>
	</div>
</a>
