<script lang="ts" module>
	import { slide } from 'svelte/transition';
	import { type Transition, type TransitionParams, type CssClasses, prefersReducedMotionStore } from '../../index.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type SlideTransition = typeof slide;
	type TransitionIn = Transition;
	type TransitionOut = Transition;
</script>

<script lang="ts" generics="TransitionIn extends Transition = SlideTransition, TransitionOut extends Transition = SlideTransition">
	import { untrack } from 'svelte';
	// NOTE: we cannot describe the default slot.

	import { writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';

	// Props (transition)

	interface Props {
		class?: string;
		/** Set the auto-collapse mode. */
		autocollapse?: boolean;
		/** Provide classes to set the accordion width. */
		width?: CssClasses;
		/** Provide classes to set the vertical spacing between items. */
		spacing?: CssClasses;
		/** Set the accordion disabled state for all items. */
		disabled?: boolean;
		/** Provide classes to set the accordion item padding styles. */
		padding?: CssClasses;
		/** Provide classes to set the accordion item hover styles. */
		hover?: CssClasses;
		/** Provide classes to set the accordion item rounded styles. */
		rounded?: CssClasses;
		/** Set the rotation of the item caret in the open state. */
		caretOpen?: CssClasses;
		/** Set the rotation of the item caret in the closed state. */
		caretClosed?: CssClasses;
		/** Provide arbitrary classes to the trigger button region. */
		regionControl?: CssClasses;
		/** Provide arbitrary classes to the content panel region. */
		regionPanel?: CssClasses;
		/** Provide arbitrary classes to the caret icon region. */
		regionCaret?: CssClasses;
		/** Enable/Disable transitions */
		transitions?: boolean;
		/** Provide the transition to used on entry. */
		transitionIn?: TransitionIn;
		/** Transition params provided to `transitionIn`. */
		transitionInParams?: TransitionParams<TransitionIn>;
		/** Provide the transition to used on exit. */
		transitionOut?: TransitionOut;
		/** Transition params provided to `transitionOut`. */
		transitionOutParams?: TransitionParams<TransitionOut>;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		autocollapse = false,
		width = 'w-full',
		spacing = 'space-y-1',
		disabled = false,
		padding = 'py-2 px-4',
		hover = 'hover:bg-primary-hover-token',
		rounded = 'rounded-container-token',
		caretOpen = 'rotate-180',
		caretClosed = '',
		regionControl = '',
		regionPanel = 'space-y-4',
		regionCaret = '',
		transitions = !$prefersReducedMotionStore,
		transitionIn = slide as TransitionIn,
		transitionInParams = { duration: 200 },
		transitionOut = slide as TransitionOut,
		transitionOutParams = { duration: 200 },
		children
	}: Props = $props();

	// Local
	const active: Writable<string | null> = writable(null);

	// Context API
	untrack(() => setContext('active', active));
	untrack(() => setContext('autocollapse', autocollapse));
	untrack(() => setContext('disabled', disabled));
	untrack(() => setContext('padding', padding));
	untrack(() => setContext('hover', hover));
	untrack(() => setContext('rounded', rounded));
	untrack(() => setContext('caretOpen', caretOpen));
	untrack(() => setContext('caretClosed', caretClosed));
	untrack(() => setContext('regionControl', regionControl));
	untrack(() => setContext('regionPanel', regionPanel));
	untrack(() => setContext('regionCaret', regionCaret));
	untrack(() => setContext('transitions', transitions));
	untrack(() => setContext('transitionIn', transitionIn));
	untrack(() => setContext('transitionInParams', transitionInParams));
	untrack(() => setContext('transitionOut', transitionOut));
	untrack(() => setContext('transitionOutParams', transitionOutParams));

	// Reactive
	let classesBase = $derived(`${width} ${spacing} ${className ?? ''}`);
</script>

<!-- @component The Accordion parent element. -->

<div class="accordion {classesBase}" data-testid="accordion">
	{@render children?.()}
</div>
