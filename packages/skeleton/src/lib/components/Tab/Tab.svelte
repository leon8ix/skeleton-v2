<script lang="ts">
	// Slots
	/** @slot lead - Provides a leading position, which can be used for icons. */

	import { getContext } from 'svelte';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Context

	interface Props {
		class?: string;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onchange?: ((event: Event) => void) | undefined;
		/** Set the radio group binding value. */
		group: any;
		/** Set a unique name value for the input. */
		name: string;
		/** Set the input's value. */
		value: any;
		/** Provide a hoverable title attribute for the tab. */
		title?: string;
		/** Set the ARIA controls value to define which panel this tab controls. */
		controls?: string;
		/** Provide arbitrary classes to style the tab region. */
		regionTab?: CssClasses;
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
		onkeydown = undefined,
		onkeyup = undefined,
		onkeypress = undefined,
		onclick = undefined,
		onchange = undefined,
		group = $bindable(),
		name,
		value,
		title = '',
		controls = '',
		regionTab = '',
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

	// Local
	let elemInput = $state<HTMLElement>();

	// A11y Key Down Handler
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLDivElement>): void {
		if (!elemInput) return;
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			elemInput?.click();
		} else if (event.code === 'ArrowRight') {
			const tabList = elemInput.closest('.tab-list');
			if (!tabList) return;
			const tabs = Array.from(tabList.querySelectorAll('.tab'));

			const currTab = elemInput.closest('.tab');
			if (!currTab) return;

			const currIndex = tabs.indexOf(currTab);
			const nextIndex = currIndex + 1 >= tabs.length ? 0 : currIndex + 1;
			const nextTab = tabs[nextIndex];
			const nextTabInput = nextTab?.querySelector('input');
			if (nextTab && nextTabInput) {
				nextTabInput.click();
				(nextTab as HTMLElement).focus();
			}
		} else if (event.code === 'ArrowLeft') {
			const tabList = elemInput.closest('.tab-list');
			if (!tabList) return;
			const tabs = Array.from(tabList.querySelectorAll('.tab'));

			const currTab = elemInput.closest('.tab');
			if (!currTab) return;

			const currIndex = tabs.indexOf(currTab);
			const nextIndex = currIndex - 1 < 0 ? tabs.length - 1 : currIndex - 1;
			const nextTab = tabs[nextIndex];
			const nextTabInput = nextTab?.querySelector('input');
			if (nextTab && nextTabInput) {
				nextTabInput.click();
				(nextTab as HTMLElement).focus();
			}
		}
	}

	// Reactive
	let selected = $derived(value === group);
	let classesActive = $derived(selected ? active : hover);
	let classesBase = $derived(`${cBase} ${flex} ${padding} ${rounded} ${classesActive} ${className ?? ''}`);
	let classesInterface = $derived(`${cInterface} ${spacing}`);
	let classesTab = $derived(`${regionTab}`);

	// RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<label class={classesBase} {title}>
	<!-- A11y attributes are not allowed on <label> -->
	<div
		class="tab {classesTab}"
		data-testid="tab"
		role="tab"
		aria-controls={controls}
		aria-selected={selected}
		tabindex={selected ? 0 : -1}
		onkeydown={(event) => {
			onKeyDown(event);
			onkeydown?.(event);
		}}
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
		<div class="tab-interface {classesInterface}">
			{#if lead}<div class="tab-lead">{@render lead?.()}</div>{/if}
			<div class="tab-label">{@render children?.()}</div>
		</div>
	</div>
</label>
