<script lang="ts" module>
	import { slide } from 'svelte/transition';
	import { prefersReducedMotionStore, type Transition, type TransitionParams } from '../../index.js';
	import { dynamicTransition } from '../../internal/transitions.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type SlideTransition = typeof slide;
	type TransitionIn = Transition;
	type TransitionOut = Transition;
	type Value = unknown;
	type Meta = unknown;
</script>

<script
	lang="ts"
	generics="Value = unknown, Meta = unknown, 
	TransitionIn extends Transition = SlideTransition, TransitionOut extends Transition = SlideTransition"
>
	// import { flip } from 'svelte/animate';
	// import {slide} from 'svelte/transition';

	// Types
	import type { AutocompleteOption } from './types.js';
	type Option = AutocompleteOption<Value, Meta>;

	// Event Dispatcher
	type AutocompleteEvent = {
		selection: Option;
	};

	// Props (transition)

	interface Props {
		class?: string;
		onselection?: ((event: AutocompleteEvent['selection']) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		/** Bind the input value. */
		input?: unknown | undefined;
		/** Define values for the list. */
		options?: Option[];
		/** Limit the total number of suggestions. */
		limit?: number | undefined;
		/** Provide allowlist values. */
		allowlist?: Value[];
		/** Provide denylist values. */
		denylist?: Value[];
		/** Provide a HTML markup to display when no match is found. */
		emptyState?: string;
		/** Provide arbitrary classes to nav element. */
		regionNav?: string;
		/** Provide arbitrary classes to each list. */
		regionList?: string;
		/** Provide arbitrary classes to each list item. */
		regionItem?: string;
		/** Provide arbitrary classes to each button. */
		regionButton?: string;
		/** Provide arbitrary classes to empty message. */
		regionEmpty?: string;
		/** Provide a custom filter function. */
		filter?: () => Option[];
		/** Enable/Disable transitions */
		transitions?: boolean;
		/** Provide the transition used on entry. */
		transitionIn?: TransitionIn;
		/** Transition params provided to `transitionIn`. */
		transitionInParams?: TransitionParams<TransitionIn>;
		/** Provide the transition used on exit. */
		transitionOut?: TransitionOut;
		/** Transition params provided to `transitionOut`. */
		transitionOutParams?: TransitionParams<TransitionOut>;
	}

	let {
		class: className = '',
		onselection = undefined,
		onclick = undefined,
		onkeypress = undefined,
		input = undefined,
		options = [],
		limit = undefined,
		allowlist = [],
		denylist = [],
		emptyState = 'No Results Found.',
		regionNav = '',
		regionList = 'list-nav',
		regionItem = '',
		regionButton = 'w-full',
		regionEmpty = 'text-center',
		filter = filterOptions,
		transitions = !$prefersReducedMotionStore,
		transitionIn = slide as TransitionIn,
		transitionInParams = { duration: 200 },
		transitionOut = slide as TransitionOut,
		transitionOutParams = { duration: 200 }
	}: Props = $props();

	// Local
	let listedOptions = $derived(filterByAllowDeny(allowlist, denylist));

	function filterByAllowDeny(allowlist: Value[], denylist: Value[]) {
		let _options = [...options];
		// Allowed Options
		if (allowlist.length) {
			_options = _options.filter((option) => allowlist.includes(option.value));
		}

		// Denied Options
		if (denylist.length) {
			_options = _options.filter((option) => !denylist.includes(option.value));
		}

		// Reset options
		if (!allowlist.length && !denylist.length) {
			_options = options;
		}

		return _options;
	}

	function filterOptions(): Option[] {
		// Create a local copy of options
		let _options = [...listedOptions];
		// Filter options
		_options = _options.filter((option) => {
			// Format the input search value
			const inputFormatted = String(input).toLowerCase().trim();
			// Format the option
			let optionFormatted = JSON.stringify([option.label, option.value, option.keywords]).toLowerCase();
			// Check Match
			if (optionFormatted.includes(inputFormatted)) return option;
		});
		return _options;
	}

	function onSelection(option: Option) {
		/** @event {Option} selection - Fire on option select. */
		onselection?.(option);
	}

	// State

	let optionsFiltered = $derived(input ? filter() : listedOptions);
	let sliceLimit = $derived(limit ?? optionsFiltered.length);
	// Reactive
	let classesBase = $derived(`${className ?? ''}`);
	let classesNav = $derived(`${regionNav}`);
	let classesList = $derived(`${regionList}`);
	let classesItem = $derived(`${regionItem}`);
	let classesButton = $derived(`${regionButton}`);
	let classesEmpty = $derived(`${regionEmpty}`);
</script>

<!-- animate:flip={{ duration }} -->
<div class="autocomplete {classesBase}" data-testid="autocomplete">
	{#if optionsFiltered.length > 0}
		<nav class="autocomplete-nav {classesNav}">
			<ul class="autocomplete-list {classesList}">
				{#each optionsFiltered.slice(0, sliceLimit) as option (option)}
					<li
						class="autocomplete-item {classesItem}"
						in:dynamicTransition|local={{ transition: transitionIn, params: transitionInParams, enabled: transitions }}
						out:dynamicTransition|local={{ transition: transitionOut, params: transitionOutParams, enabled: transitions }}
					>
						<button
							class="autocomplete-button {classesButton}"
							type="button"
							onclick={(event) => {
								onSelection(option);
								onclick?.(event);
							}}
							onkeypress={(event) => onkeypress?.(event)}
						>
							{@html option.label}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	{:else}
		<div class="autocomplete-empty {classesEmpty}">{@html emptyState}</div>
	{/if}
</div>
