<script lang="ts">
	import { getContext } from 'svelte';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Props (A11y)

	interface Props {
		disabled?: boolean;
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
		/** Set the hover title. */
		title?: string;
		/** Defines a semantic ARIA label. */
		label?: string;
		// Context
		rounded?: CssClasses;
		padding?: CssClasses;
		active?: CssClasses;
		hover?: CssClasses;
		color?: CssClasses;
		fill?: CssClasses;
		regionLabel?: CssClasses;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		disabled: disabledAttribute = false,
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
		label = '',
		rounded = getContext<NonNullable<Props['rounded']>>('rounded'),
		padding = getContext<NonNullable<Props['padding']>>('padding'),
		active = getContext<NonNullable<Props['active']>>('active'),
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		color = getContext<NonNullable<Props['color']>>('color'),
		fill = getContext<NonNullable<Props['fill']>>('fill'),
		regionLabel = getContext<NonNullable<Props['regionLabel']>>('regionLabel'),
		children,
		...rest
	}: Props = $props();

	// Classes
	const cBase = 'flex-auto';
	const cWrapper = 'text-base text-center cursor-pointer';
	const cDisabled = 'opacity-50 cursor-not-allowed';

	// Local
	let elemInput = $state<HTMLElement>();

	// A11y Key Down Handler
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLDivElement>): void {
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			elemInput?.click();
		}
	}

	// State
	let checked = $derived(value === group);
	let classesActive = $derived(checked ? `${active} ${color} ${fill}` : hover);
	let classesDisabled = $derived(disabledAttribute ? cDisabled : '');
	// Reactive
	let classsBase = $derived(`${cBase}`);
	let classesWrapper = $derived(`${cWrapper} ${padding} ${rounded} ${classesActive} ${classesDisabled} ${className ?? ''}`);

	// RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<label class="radio-label {classsBase} {regionLabel}">
	<!-- A11y attributes are not allowed on <label> -->
	<div
		class="radio-item {classesWrapper}"
		data-testid="radio-item"
		role="radio"
		aria-checked={checked}
		aria-label={label}
		tabindex="0"
		{title}
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
		{@render children?.()}
	</div>
</label>
