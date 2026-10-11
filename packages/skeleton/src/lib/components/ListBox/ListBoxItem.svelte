<script lang="ts">
	// Slots
	/** @slot lead - Positioned on the left of each row item. @slot trail - Positioned on the right of each row item. */

	import { getContext } from 'svelte';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Props

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
		// Context
		disabled?: boolean;
		multiple?: boolean;
		rounded?: CssClasses;
		active?: CssClasses;
		hover?: CssClasses;
		padding?: CssClasses;
		regionLead?: CssClasses;
		regionDefault?: CssClasses;
		regionTrail?: CssClasses;
		lead?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		trail?: import('svelte').Snippet;
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
		disabled = getContext<NonNullable<Props['disabled']>>('disabled'),
		multiple = getContext<NonNullable<Props['multiple']>>('multiple'),
		rounded = getContext<NonNullable<Props['rounded']>>('rounded'),
		active = getContext<NonNullable<Props['active']>>('active'),
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		padding = getContext<NonNullable<Props['padding']>>('padding'),
		regionLead = getContext<NonNullable<Props['regionLead']>>('regionLead'),
		regionDefault = getContext<NonNullable<Props['regionDefault']>>('regionDefault'),
		regionTrail = getContext<NonNullable<Props['regionTrail']>>('regionTrail'),
		lead,
		children,
		trail
	}: Props = $props();

	// Classes
	const cBase = 'cursor-pointer -outline-offset-[3px]';
	const cDisabled = 'opacity-50 !cursor-default';
	const cLabel = 'flex items-center space-x-4';

	// Local

	let elemInput = $state<HTMLElement>();

	// Functionality
	function areDeeplyEqual(param1: unknown, param2: unknown) {
		// check strict equality
		if (param1 === param2) return true;
		// check if props are not objects
		if (!(param1 instanceof Object) || !(param2 instanceof Object)) return false;

		// object keys
		const keys1 = Object.keys(param1);
		const keys2 = Object.keys(param2);
		// check if number of keys are the same
		if (keys1.length !== keys2.length) return false;
		// Iterate over the keys and compare the values recursively
		for (const key of keys1) {
			const value1 = (param1 as Record<string, unknown>)[key];
			const value2 = (param2 as Record<string, unknown>)[key];
			if (!areDeeplyEqual(value1, value2)) return false;
		}
		return true;
	}

	// A11y Key Down Handler
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLDivElement>): void {
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			elemInput?.click();
		}
	}

	// Native bind:group only groups inputs within one component instance.
	function onCheckboxChange(event: Event & { currentTarget: HTMLInputElement }): void {
		group = event.currentTarget.checked ? [...group, value] : group.filter((entry: unknown) => !areDeeplyEqual(entry, value));
		onchange?.(event);
	}

	// Base Classes
	const cRegionLead = '';
	const cRegionDefault = 'flex-1';
	const cRegionTrail = '';

	// Reactive
	let selected = $derived(multiple ? group.some((groupVal: unknown) => areDeeplyEqual(value, groupVal)) : areDeeplyEqual(group, value));
	let classesActive = $derived(selected ? active : !disabled ? hover : '');
	let classesDisabled = $derived(disabled ? cDisabled : '');
	let classesBase = $derived(`${cBase} ${classesDisabled} ${rounded} ${padding} ${classesActive} ${className ?? ''}`);
	let classesLabel = $derived(`${cLabel}`);
	let classesRegionLead = $derived(`${cRegionLead} ${regionLead}`);
	let classesRegionDefault = $derived(`${cRegionDefault} ${regionDefault}`);
	let classesRegionTrail = $derived(`${cRegionTrail} ${regionTrail}`);
</script>

<label>
	<!-- A11y attributes are not allowed on <label> -->
	<div
		class="listbox-item {classesBase}"
		data-testid="listbox-item"
		role="option"
		aria-selected={selected}
		tabindex="0"
		onkeydown={(event) => {
			onKeyDown(event);
			onkeydown?.(event);
		}}
		onkeyup={(event) => onkeyup?.(event)}
		onkeypress={(event) => onkeypress?.(event)}
	>
		<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
		<div class="h-0 w-0 overflow-hidden">
			{#if multiple}
				<input
					{disabled}
					bind:this={elemInput}
					type="checkbox"
					{name}
					{value}
					checked={selected}
					tabindex="-1"
					onclick={(event) => onclick?.(event)}
					onchange={onCheckboxChange}
				/>
			{:else}
				<input
					{disabled}
					bind:this={elemInput}
					type="radio"
					bind:group
					{name}
					{value}
					tabindex="-1"
					onclick={(event) => onclick?.(event)}
					onchange={(event) => onchange?.(event)}
				/>
			{/if}
		</div>
		<!-- <slot /> -->
		<div class="listbox-label {classesLabel}">
			<!-- Slot: Lead -->
			{#if lead}<div class="listbox-label-lead {classesRegionLead}">{@render lead?.()}</div>{/if}
			<!-- Slot: Default -->
			<div class="listbox-label-content {classesRegionDefault}">{@render children?.()}</div>
			<!-- Slot: Trail -->
			{#if trail}<div class="listbox-label-trail {classesRegionTrail}">{@render trail?.()}</div>{/if}
		</div>
	</div>
</label>
