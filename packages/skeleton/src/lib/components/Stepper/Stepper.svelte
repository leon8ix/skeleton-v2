<script lang="ts" module>
	import { fade } from 'svelte/transition';
	import { type Transition, type TransitionParams, prefersReducedMotionStore } from '../../index.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type FadeTransition = typeof fade;
	type TransitionIn = Transition;
	type TransitionOut = Transition;
</script>

<script lang="ts" generics="TransitionIn extends Transition = FadeTransition, TransitionOut extends Transition = FadeTransition">
	import { untrack } from 'svelte';
	import { setContext } from 'svelte';
	import { type Writable, writable } from 'svelte/store';
	import { dynamicTransition } from '../../internal/transitions.js';

	// Types
	import type { CssClasses } from '../../index.js';
	import type { StepperButton, StepperEvent, StepperState } from './types.js';

	// Event Dispatcher

	// Button (back)

	// Button (next)

	// Button (complete)

	// Props (transition)

	interface Props {
		class?: string;
		onnext?: ((event: StepperEvent['next']) => void) | undefined;
		onstep?: ((event: StepperEvent['step']) => void) | undefined;
		onback?: ((event: StepperEvent['back']) => void) | undefined;
		oncomplete?: ((event: StepperEvent['complete']) => void) | undefined;
		/** Provide classes to style the stepper header gap. */
		gap?: CssClasses;
		/** Provide the verbiage that represents "Step". */
		stepTerm?: string;
		/** Provide classes to style the stepper header badges. */
		badge?: CssClasses;
		/** Provide classes to style the stepper header active step badge. */
		active?: CssClasses;
		/** Provide classes to style the stepper header border. */
		border?: CssClasses;
		/** Provide the initially selected step */
		start?: number;
		/** Set the justification for the step navigation buttons. */
		justify?: CssClasses;
		/** Provide arbitrary classes to style the back button. */
		buttonBack?: CssClasses;
		/** Set the type of the back button. */
		buttonBackType?: StepperButton;
		/** Provide the HTML label content for the back button. */
		buttonBackLabel?: string;
		/** Provide arbitrary classes to style the next button. */
		buttonNext?: CssClasses;
		/** Set the type of the next button. */
		buttonNextType?: StepperButton;
		/** Provide the HTML label content for the next button. */
		buttonNextLabel?: string;
		/** Provide arbitrary classes to style the complete button. */
		buttonComplete?: CssClasses;
		/** Set the type of the complete button. */
		buttonCompleteType?: StepperButton;
		/** Provide the HTML label content for the complete button. */
		buttonCompleteLabel?: string;
		/** Provide arbitrary classes to the stepper header region. */
		regionHeader?: CssClasses;
		/** Provide arbitrary classes to the stepper content region. */
		regionContent?: CssClasses;
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
		onnext = undefined,
		onstep = undefined,
		onback = undefined,
		oncomplete = undefined,
		gap = 'gap-4',
		stepTerm = 'Step',
		badge = 'variant-filled-surface',
		active = 'variant-filled',
		border = 'border-surface-400-500-token',
		start = 0,
		justify = 'justify-between',
		buttonBack = 'variant-ghost',
		buttonBackType = 'button',
		buttonBackLabel = '&larr; Back',
		buttonNext = 'variant-filled',
		buttonNextType = 'button',
		buttonNextLabel = 'Next &rarr;',
		buttonComplete = 'variant-filled-primary',
		buttonCompleteType = 'button',
		buttonCompleteLabel = 'Complete',
		regionHeader = '',
		regionContent = '',
		transitions = !$prefersReducedMotionStore,
		transitionIn = fade as TransitionIn,
		transitionInParams = { duration: 100 },
		transitionOut = fade as TransitionOut,
		transitionOutParams = { duration: 100 },
		children
	}: Props = $props();

	// Stores
	let stepState: Writable<StepperState> = writable({ current: untrack(() => start), total: 0 });

	// Event Handlers
	async function onNext(locked: boolean, stepIndex: number) {
		// Allows any forms to submit before the Step is removed from the DOM:
		// https://github.com/skeletonlabs/skeleton/issues/1328
		await new Promise((resolve) => setTimeout(resolve));

		if (locked) return;
		$stepState.current++;
		/** @event { step: number, $stepState: StepperState } next - Fires when the NEXT button is pressed per step. */
		onnext?.({ step: stepIndex, state: $stepState });
		/** @event { step: number, $stepState: StepperState } step - Fires when a next/previous step occurs. */
		onstep?.({ step: stepIndex, state: $stepState });
	}
	function onBack(stepIndex: number) {
		$stepState.current--;
		/** @event { step: number, $stepState: StepperState } back - Fires when the BACK button is pressed per step. */
		onback?.({ step: stepIndex, state: $stepState });
		onstep?.({ step: stepIndex, state: $stepState });
	}
	function onComplete(stepIndex: number) {
		/** @event { step: number, $stepState: StepperState } complete - Fires when the COMPLETE button is pressed. */
		oncomplete?.({ step: stepIndex, state: $stepState });
	}

	// Context
	untrack(() => setContext('state', stepState));
	untrack(() => setContext('stepTerm', stepTerm));
	untrack(() => setContext('gap', gap));
	untrack(() => setContext('justify', justify));
	// ---
	untrack(() => setContext('onNext', onNext));
	untrack(() => setContext('onBack', onBack));
	untrack(() => setContext('onComplete', onComplete));
	// ---
	untrack(() => setContext('buttonBack', buttonBack));
	untrack(() => setContext('buttonBackType', buttonBackType));
	untrack(() => setContext('buttonBackLabel', buttonBackLabel));
	// ---
	untrack(() => setContext('buttonNext', buttonNext));
	untrack(() => setContext('buttonNextType', buttonNextType));
	untrack(() => setContext('buttonNextLabel', buttonNextLabel));
	// ---
	untrack(() => setContext('buttonComplete', buttonComplete));
	untrack(() => setContext('buttonCompleteType', buttonCompleteType));
	untrack(() => setContext('buttonCompleteLabel', buttonCompleteLabel));
	// ---
	untrack(() => setContext('transitions', transitions));
	untrack(() => setContext('transitionIn', transitionIn));
	untrack(() => setContext('transitionInParams', transitionInParams));
	untrack(() => setContext('transitionOut', transitionOut));
	untrack(() => setContext('transitionOutParams', transitionOutParams));

	// Classes
	const cBase = 'space-y-4';
	const cHeader = 'flex items-center border-t mt-[15px]';
	const cHeaderStep = '-mt-[15px] transition-all duration-300';
	const cContent = '';

	// State
	let isActive = $derived((step: number) => step === $stepState.current);
	// Reactive
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesHeader = $derived(`${cHeader} ${border} ${gap} ${regionHeader}`);
	let classesHeaderStep = $derived(`${cHeaderStep}`);
	let classesBadge = $derived((step: number) => (isActive(step) ? active : badge));
	let classesContent = $derived(`${cContent} ${regionContent}`);
</script>

<div class="stepper {classesBase}" data-testid="stepper">
	<!-- Header -->
	{#if $stepState.total}
		<header
			class="stepper-header {classesHeader}"
			in:dynamicTransition|local={{ transition: transitionIn, params: transitionInParams, enabled: transitions }}
			out:dynamicTransition|local={{ transition: transitionOut, params: transitionOutParams, enabled: transitions }}
		>
			{#each Array.from(Array($stepState.total).keys()) as step}
				<div class="stepper-header-step {classesHeaderStep}" class:flex-1={isActive(step)}>
					<span class="badge {classesBadge(step)}">{isActive(step) ? `${stepTerm} ${step + 1}` : step + 1}</span>
				</div>
			{/each}
		</header>
	{/if}
	<!-- Content -->
	<div class="stepper-content {classesContent}">
		{@render children?.()}
	</div>
</div>
