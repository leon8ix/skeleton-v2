<script lang="ts" module>
	import { fly, scale } from 'svelte/transition';
	import { type Transition, type TransitionParams, prefersReducedMotionStore } from '../../index.js';
	import { dynamicTransition } from '../../internal/transitions.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type FlyTransition = typeof fly;
	type ListTransitionIn = Transition;
	type ListTransitionOut = Transition;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type ScaleTransition = typeof scale;
	type ChipTransitionIn = Transition;
	type ChipTransitionOut = Transition;
</script>

<script
	lang="ts"
	generics="ListTransitionIn extends Transition = FlyTransition, ListTransitionOut extends Transition = FlyTransition, ChipTransitionIn extends Transition = ScaleTransition, ChipTransitionOut extends Transition = ScaleTransition"
>
	import { onMount, untrack } from 'svelte';
	import { flip } from 'svelte/animate';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// Event Dispatcher
	type InputChipEvent = {
		add: { event: KeyboardEvent; chipIndex: number; chipValue: string };
		remove: { event: MouseEvent; chipIndex: number; chipValue: string };
		addManually: { chipIndex: number; chipValue: string };
		removeManually: { chipValue: string };
		invalid: { event: KeyboardEvent; input: string };
		invalidManually: { input: string };
	};

	// Props (transition)

	interface Props {
		class?: string;
		oninvalid?: ((event: InputChipEvent['invalid']) => void) | undefined;
		onadd?: ((event: InputChipEvent['add']) => void) | undefined;
		onremove?: ((event: InputChipEvent['remove']) => void) | undefined;
		oninvalidManually?: ((event: InputChipEvent['invalidManually']) => void) | undefined;
		onaddManually?: ((event: InputChipEvent['addManually']) => void) | undefined;
		onremoveManually?: ((event: InputChipEvent['removeManually']) => void) | undefined;
		oninput?: ((event: Event) => void) | undefined;
		onfocus?: ((event: FocusEvent) => void) | undefined;
		onblur?: ((event: FocusEvent) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		/** Bind the input value. */
		input?: string;
		/** Set a unique select input name. */
		name: string;
		/** An array of values. */
		value?: any[];
		/** Provide a whitelist of accepted values. */
		whitelist?: string[];
		/** Maximum number of chips. Set -1 to disable. */
		max?: any;
		/** Set the minimum character length. */
		minlength?: any;
		/** Set the maximum character length. */
		maxlength?: any;
		/** When enabled, allows for uppercase values. */
		allowUpperCase?: boolean;
		/** When enabled, allows for duplicate values. */
		allowDuplicates?: boolean;
		/** Provide a custom validator function. */
		validation?: (...args: any[]) => boolean;
		/** The duration of the flip (first, last, invert, play) animation. */
		duration?: number;
		/** Set the required state for this input field. */
		required?: boolean;
		/** Provide classes or a variant to style the chips. */
		chips?: CssClasses;
		/** Provide classes used to indicate invalid state. */
		invalid?: CssClasses;
		/** Provide classes to set padding styles. */
		padding?: CssClasses;
		/** Provide classes to set border radius styles. */
		rounded?: CssClasses;
		/** Provide arbitrary classes to style the chip wrapper region. */
		regionChipWrapper?: CssClasses;
		/** Provide arbitrary classes to style the chip list region. */
		regionChipList?: CssClasses;
		/** Provide arbitrary classes to style the input field region. */
		regionInput?: CssClasses;
		/** Provide the ARIA label for the select input. */
		label?: string;
		/** Enable/Disable transitions */
		transitions?: boolean;
		/** Provide the transition used in list on entry. */
		listTransitionIn?: ListTransitionIn;
		/** Transition params provided to `ListTransitionIn`. */
		listTransitionInParams?: TransitionParams<ListTransitionIn>;
		/** Provide the transition used in list on exit. */
		listTransitionOut?: ListTransitionOut;
		/** Transition params provided to `ListTransitionOut`. */
		listTransitionOutParams?: TransitionParams<ListTransitionOut>;
		/** Provide the transition used in chip on entry. */
		chipTransitionIn?: ChipTransitionIn;
		/** Transition params provided to `ChipTransitionIn`. */
		chipTransitionInParams?: TransitionParams<ChipTransitionIn>;
		/** Provide the transition used in chip on exit. */
		chipTransitionOut?: ChipTransitionOut;
		/** Transition params provided to `ChipTransitionOut`. */
		chipTransitionOutParams?: TransitionParams<ChipTransitionOut>;
		[key: string]: any;
	}

	let {
		class: className = '',
		oninvalid = undefined,
		onadd = undefined,
		onremove = undefined,
		oninvalidManually = undefined,
		onaddManually = undefined,
		onremoveManually = undefined,
		oninput = undefined,
		onfocus = undefined,
		onblur = undefined,
		onclick = undefined,
		onkeypress = undefined,
		onkeydown = undefined,
		onkeyup = undefined,
		input = $bindable(''),
		name,
		value = $bindable([]),
		whitelist = [],
		max = -1,
		minlength = -1,
		maxlength = -1,
		allowUpperCase = false,
		allowDuplicates = false,
		validation = () => true,
		duration = 150,
		required = false,
		chips = 'variant-filled',
		invalid = 'input-error',
		padding = 'p-2',
		rounded = 'rounded-container-token',
		regionChipWrapper = '',
		regionChipList = '',
		regionInput = '',
		label = 'Chips select',
		transitions = !$prefersReducedMotionStore,
		listTransitionIn = fly as ListTransitionIn,
		listTransitionInParams = { duration: 150, opacity: 0, y: -20 },
		listTransitionOut = fly as ListTransitionOut,
		listTransitionOutParams = { duration: 150, opacity: 0, y: -20 },
		chipTransitionIn = scale as ChipTransitionIn,
		chipTransitionInParams = { duration: 150, opacity: 0 },
		chipTransitionOut = scale as ChipTransitionOut,
		chipTransitionOutParams = { duration: 150, opacity: 0 },
		...rest
	}: Props = $props();

	// Classes
	const cBase = 'textarea cursor-pointer';
	const cChipWrapper = 'space-y-4';
	const cChipList = 'flex flex-wrap gap-2';
	const cInputField = 'unstyled bg-transparent border-0 !ring-0 p-0 w-full';

	// Local
	let inputValid: boolean = $state(true);
	let chipValues: Array<{ val: (typeof value)[0]; id: number }> = $state([]);

	// Reset Form
	function resetFormHandler() {
		value = [];
	}
	let selectElement = $state<HTMLSelectElement>();
	onMount(() => {
		// Verify external form is present
		if (!selectElement?.form) return;

		const externalForm = selectElement.form as HTMLFormElement;

		// Attach reset event listener to external form
		externalForm.addEventListener('reset', resetFormHandler);

		// Return onDestroy handler that will remove the event listener from the external form
		return () => {
			externalForm.removeEventListener('reset', resetFormHandler);
		};
	});

	function validateCustom(chip: string) {
		return validation === undefined || validation(chip);
	}

	function validateCount() {
		return max === -1 || value.length < max;
	}

	function validateLength(chip: string) {
		return (minlength === -1 || chip.length >= minlength) && (maxlength === -1 || chip.length <= maxlength);
	}

	function validateWhiteList(chip: string) {
		return whitelist.length === 0 || whitelist.includes(chip);
	}

	function validateDuplicates(chip: string) {
		return allowDuplicates || !value.includes(chip);
	}

	function validate(chip = ''): boolean {
		if (!chip && !input) return false;
		// Format: trim value
		chip = chip !== '' ? chip.trim() : input.trim();
		return validateCustom(chip) && validateCount() && validateLength(chip) && validateWhiteList(chip) && validateDuplicates(chip);
	}

	function addChipCommon(chip: string) {
		// Format: to lowercase (if enabled)
		chip = allowUpperCase ? chip : chip.toLowerCase();
		// Append value to array
		value.push(chip);
		value = value;
		chipValues.push({ val: chip, id: Math.random() });
		chipValues = chipValues;
	}

	function removeChipCommon(chip: string) {
		let chipIndex = value.indexOf(chip);
		// Remove value from array
		value.splice(chipIndex, 1);
		value = value;
		chipValues.splice(chipIndex, 1);
		chipValues = chipValues;
	}

	function onKeyHandler(event: KeyboardEvent): void {
		// Monitor for Enter Key
		if (event.key !== 'Enter') return;
		// Prevent default behavior
		event.preventDefault();
		// Validate
		inputValid = validate();
		// When the onInvalid hook is present
		if (inputValid === false) {
			/** @event {{ event: Event, input: any  }} invalid - Fires when the input value is invalid. */
			oninvalid?.({ event, input });
			return;
		}
		addChipCommon(input);
		/** @event {{ event: Event, chipIndex: number, chipValue: string }} add - Fires when a chip is added. */
		onadd?.({ event, chipIndex: value.length - 1, chipValue: input });
		// Clear input value
		input = '';
	}

	function removeChipInternally(event: SvelteEvent<MouseEvent, HTMLButtonElement>, chipIndex: number, chipValue: string): void {
		if (rest.disabled) return;
		removeChipCommon(chipValue);
		/** @event {{ event: Event, chipIndex: number, chipValue: string }} remove - Fires when a chip is removed. */
		onremove?.({ event, chipIndex, chipValue });
	}

	// Export functions
	export function addChip(chip: string) {
		// Validate
		inputValid = validate(chip);
		// When the onInvalid hook is present
		if (inputValid === false) {
			/** @event {{ input: string  }} invalidManually - Fires when the manually added value is invalid. */
			oninvalidManually?.({ input: chip });
			return;
		}
		addChipCommon(chip);
		/** @event {{ chipIndex: number, chipValue: string }} addManually - Fires when a chip is added manually. */
		onaddManually?.({ chipIndex: value.length - 1, chipValue: chip });
	}

	export function removeChip(chip: string) {
		if (rest.disabled) return;
		removeChipCommon(chip);
		/** @event {{ chipValue: string }} removeManually - Fires when a chip is removed manually. */
		onremoveManually?.({ chipValue: chip });
	}

	// Pruned RestProps
	function prunedRestProps() {
		return rest;
	}

	// State
	let classesInvalid = $derived(!inputValid ? invalid : '');
	// Reactive
	let classesBase = $derived(`${cBase} ${padding} ${rounded} ${className ?? ''} ${classesInvalid}`);
	let classesChipWrapper = $derived(`${cChipWrapper} ${regionChipWrapper}`);
	let classesChipList = $derived(`${cChipList} ${regionChipList}`);
	let classesInput = $derived(`${cInputField} ${regionInput}`);
	$effect.pre(() => {
		const next = value?.slice() || [];
		untrack(() => {
			chipValues = next.map((val, i) => (chipValues[i]?.val === val ? chipValues[i] : { id: Math.random(), val }));
		});
	});
</script>

<div class="input-chip {classesBase}" class:opacity-50={rest.disabled}>
	<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
	<div class="h-0 overflow-hidden">
		<select bind:this={selectElement} bind:value {name} multiple {required} aria-label={label} tabindex="-1">
			<!-- NOTE: options are required! -->
			{#each value as option}<option value={option}>{option}</option>{/each}
		</select>
	</div>
	<!-- Chip Wrapper -->
	<div class="input-chip-wrapper {classesChipWrapper}">
		<!-- Input Field -->
		<input
			type="text"
			bind:value={input}
			placeholder={rest.placeholder ?? 'Enter values...'}
			class="input-chip-field {classesInput}"
			onkeydown={onKeyHandler}
			oninput={(event) => oninput?.(event)}
			onfocus={(event) => onfocus?.(event)}
			onblur={(event) => onblur?.(event)}
			disabled={rest.disabled}
			{...prunedRestProps()}
		/>
		<!-- Chip List -->
		{#if chipValues.length}
			<div
				class="input-chip-list {classesChipList}"
				in:dynamicTransition|local={{ transition: listTransitionIn, params: listTransitionInParams, enabled: transitions }}
				out:dynamicTransition|local={{ transition: listTransitionOut, params: listTransitionOutParams, enabled: transitions }}
			>
				{#each chipValues as { id, val }, i (id)}
					<!-- Wrapping div required for FLIP animation -->
					<div animate:flip={{ duration }}>
						<button
							type="button"
							class="chip {chips}"
							onclick={(event) => {
								removeChipInternally(event, i, val);
								onclick?.(event);
							}}
							onkeypress={(event) => onkeypress?.(event)}
							onkeydown={(event) => onkeydown?.(event)}
							onkeyup={(event) => onkeyup?.(event)}
							in:dynamicTransition|local={{ transition: chipTransitionIn, params: chipTransitionInParams, enabled: transitions }}
							out:dynamicTransition|local={{ transition: chipTransitionOut, params: chipTransitionOutParams, enabled: transitions }}
						>
							<span>{val}</span>
							<span>✕</span>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
