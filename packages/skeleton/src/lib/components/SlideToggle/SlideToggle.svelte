<script lang="ts">
	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Event Dispatcher
	type SlideToggleEvent = {
		keyup: SvelteEvent<KeyboardEvent, HTMLDivElement>;
	};

	// Props (a11y)

	interface Props {
		disabled?: boolean;
		class?: string;
		onkeyup?: ((event: SlideToggleEvent['keyup']) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onmouseover?: ((event: MouseEvent) => void) | undefined;
		onchange?: ((event: Event) => void) | undefined;
		onfocus?: ((event: FocusEvent) => void) | undefined;
		onblur?: ((event: FocusEvent) => void) | undefined;
		/** Required. Set a unique name for the input. */
		name: string;
		/** The checked state of the input element. */
		checked?: boolean;
		/** Sets the size of the component. */
		size?: string;
		/** Provide classes to set the inactive state background color. */
		background?: CssClasses;
		/** Provide classes to set the active state background color. */
		active?: CssClasses;
		/** Provide classes to set the border styles. */
		border?: CssClasses;
		/** Provide classes to set border radius styles. */
		rounded?: CssClasses;
		/** Provide a semantic label. */
		label?: string;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		disabled: disabledAttribute = false,
		class: className = '',
		onkeyup = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onkeypress = undefined,
		onmouseover = undefined,
		onchange = undefined,
		onfocus = undefined,
		onblur = undefined,
		name,
		checked = $bindable(false),
		size = 'md',
		background = 'bg-surface-400 dark:bg-surface-700',
		active = 'bg-surface-900 dark:bg-surface-300',
		border = '',
		rounded = 'rounded-full',
		label = '',
		children,
		...rest
	}: Props = $props();

	// Base Styles
	const cBase = 'inline-block';
	const cLabel = 'unstyled flex items-center';
	const cTrack = 'flex transition-all duration-[200ms] cursor-pointer';
	const cThumb = 'w-[50%] h-full scale-[0.8] transition-all duration-[200ms] shadow';

	// Set track size
	let trackSize = $derived(size === 'sm' ? 'w-12 h-6' : size === 'lg' ? 'w-20 h-10' : 'w-16 h-8');

	// A11y Input Handlers
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLDivElement>) {
		// Enter/Space to toggle element
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			/** @event {{ event }} keyup Fires when the component is focused and key is pressed. */
			onkeyup?.(event);
			const inputElem = event.currentTarget.firstChild as HTMLLabelElement;
			inputElem.click();
		}
	}

	// Interactive
	let cTrackActive = $derived(checked ? active : `${background} cursor-pointer`);
	let cThumbBackground = $derived(checked ? 'bg-white/75' : 'bg-white');
	let cThumbPos = $derived(checked ? 'translate-x-full' : '');

	// Reactive Classes
	let classesDisabled = $derived(
		disabledAttribute === true ? 'opacity-50' : 'hover:brightness-[105%] dark:hover:brightness-110 cursor-pointer'
	);
	let classesBase = $derived(`${cBase} ${rounded} ${classesDisabled} ${className ?? ''}`);
	let classesLabel = $derived(`${cLabel}`);
	let classesTrack = $derived(`${cTrack} ${border} ${rounded} ${trackSize} ${cTrackActive}`);
	let classesThumb = $derived(`${cThumb} ${rounded} ${cThumbBackground} ${cThumbPos}`);

	// Prune $$restProps to avoid overwriting className
	function prunedRestProps() {
		return rest;
	}
</script>

<div
	id={label}
	class="slide-toggle {classesBase}"
	data-testid="slide-toggle"
	onkeydown={onKeyDown}
	role="switch"
	aria-label={label}
	aria-checked={checked}
	tabindex="0"
>
	<label class="slide-toggle-label {classesLabel}">
		<!-- Hidden Input -->
		<input
			type="checkbox"
			class="slide-toggle-input hidden"
			bind:checked
			{name}
			onclick={(event) => onclick?.(event)}
			onkeydown={(event) => onkeydown?.(event)}
			onkeyup={(event) => onkeyup?.(event)}
			onkeypress={(event) => onkeypress?.(event)}
			onmouseover={(event) => onmouseover?.(event)}
			onchange={(event) => onchange?.(event)}
			onfocus={(event) => onfocus?.(event)}
			onblur={(event) => onblur?.(event)}
			{...prunedRestProps()}
			disabled={disabledAttribute}
		/>
		<!-- Slider Track/Thumb -->
		<div class="slide-toggle-track {classesTrack}" class:cursor-not-allowed={disabledAttribute}>
			<div class="slide-toggle-thumb {classesThumb}" class:cursor-not-allowed={disabledAttribute}></div>
		</div>
		<!-- Label -->
		{#if children}<div class="slide-toggle-text ml-3">{@render children?.()}</div>{/if}
	</label>
</div>
