<script lang="ts">
	// Slots
	/** @slot lead - Appears above the default label, useful for icons. */

	import { getContext } from 'svelte';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Props (region)

	interface Props {
		class?: string;
		onmouseover?: ((event: MouseEvent) => void) | undefined;
		onmouseleave?: ((event: MouseEvent) => void) | undefined;
		onfocus?: ((event: FocusEvent) => void) | undefined;
		onblur?: ((event: FocusEvent) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onchange?: ((event: Event) => void) | undefined;
		/** Set the radio group binding value. */
		group: any;
		/** Set a unique name value for the input. */
		name: string;
		/** Set the input's value. */
		value: any;
		/** Provide a hoverable title attribute for the tile. */
		title?: string;
		/** Provide arbitrary classes to style the lead region. */
		regionLead?: CssClasses;
		/** Provide arbitrary classes to style the label region. */
		regionLabel?: CssClasses;
		// Context
		hover?: CssClasses;
		active?: CssClasses;
		spacing?: CssClasses;
		width?: CssClasses;
		aspectRatio?: CssClasses;
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		onmouseover = undefined,
		onmouseleave = undefined,
		onfocus = undefined,
		onblur = undefined,
		onclick = undefined,
		onkeyup = undefined,
		onkeypress = undefined,
		onchange = undefined,
		group = $bindable(),
		name,
		value,
		title = '',
		regionLead = '',
		regionLabel = '',
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		active = getContext<NonNullable<Props['active']>>('active'),
		spacing = getContext<NonNullable<Props['spacing']>>('spacing'),
		width = getContext<NonNullable<Props['width']>>('width'),
		aspectRatio = getContext<NonNullable<Props['aspectRatio']>>('aspectRatio'),
		lead,
		children,
		...rest
	}: Props = $props();

	// Classes
	const cBase = 'cursor-pointer';
	const cWrapper = 'flex flex-col justify-center items-stretch w-full';
	const cInterface = 'text-center';
	const cLabel = 'font-bold text-xs';

	// Local
	let elemInput = $state<HTMLElement>();

	// State
	let classActive = $derived(group === value ? active : '');
	// Reactive
	let classesBase = $derived(`${cBase} ${className || ''}`);
	let classesWrapper = $derived(`${cWrapper} ${aspectRatio} ${width} ${hover} ${classActive}`);
	let classesInterface = $derived(`${cInterface} ${spacing}`);
	let classesLead = $derived(`${regionLead}`);
	let classesLabel = $derived(`${cLabel} ${regionLabel}`);

	// A11y Key Down Handler
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLButtonElement>): void {
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			selectElemInput();
		}
	}

	function selectElemInput(): void {
		elemInput?.click();
	}

	// RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<label
	class="app-rail-tile {classesBase}"
	data-testid="app-rail-tile"
	{title}
	onmouseover={(event) => onmouseover?.(event)}
	onmouseleave={(event) => onmouseleave?.(event)}
	onfocus={(event) => onfocus?.(event)}
	onblur={(event) => onblur?.(event)}
>
	<!-- A11y attributes are not allowed on <label> -->
	<!-- FIXME: resolve a11y warnings -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<button
		class="app-rail-wrapper {classesWrapper}"
		tabindex="0"
		onclick={(event) => {
			selectElemInput();
			onclick?.(event);
		}}
		onkeydown={onKeyDown}
		onkeyup={(event) => onkeyup?.(event)}
		onkeypress={(event) => onkeypress?.(event)}
	>
		<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
		<div class="h-0 w-0 overflow-hidden">
			<input
				bind:this={elemInput}
				type="radio"
				bind:group
				{name}
				{value}
				{...prunedRestProps()}
				tabindex="-1"
				onclick={(event) => onclick?.(event)}
				onchange={(event) => onchange?.(event)}
			/>
		</div>
		<!-- Interface -->
		<div class="app-rail-interface {classesInterface}">
			{#if lead}<div class="app-rail-lead {classesLead}">{@render lead?.()}</div>{/if}
			<div class="app-rail-label {classesLabel}">{@render children?.()}</div>
		</div>
	</button>
</label>
