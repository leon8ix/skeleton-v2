<!-- Reference: https://dribbble.com/shots/16221169-Figma-Material-Ui-components-Steppers-and-sliders -->
<script lang="ts">
	// Slots:
	/** @slot {{}} header - Overrides the header text label. @slot {{}} navigation - Overrides the Back button position for the first step only. */

	import { getContext, onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { dynamicTransition } from '../../internal/transitions.js';

	// Types
	import type { StepperState } from './types.js';
	import type { CssClasses, Transition, TransitionParams } from '../../index.js';
	type TransitionIn = Transition;
	type TransitionOut = Transition;

	// Props (transitions)

	interface Props {
		class?: string;
		// Props
		locked?: boolean;
		/** Provide arbitrary classes to the step header region. */
		regionHeader?: CssClasses;
		/** Provide arbitrary classes to the step content region. */
		regionContent?: CssClasses;
		/** Provide arbitrary classes to the step navigation region. */
		regionNavigation?: CssClasses;
		// Context
		state?: Writable<StepperState>;
		stepTerm?: string;
		gap?: CssClasses;
		justify?: CssClasses;
		onNext?: (locked: boolean, stepIndex: number) => void;
		onBack?: (stepIndex: number) => void;
		onComplete?: (stepIndex: number) => void;
		buttonBack?: CssClasses;
		buttonBackType?: 'submit' | 'reset' | 'button';
		buttonBackLabel?: string;
		buttonNext?: CssClasses;
		buttonNextType?: 'submit' | 'reset' | 'button';
		buttonNextLabel?: string;
		buttonComplete?: CssClasses;
		buttonCompleteType?: 'submit' | 'reset' | 'button';
		buttonCompleteLabel?: string;
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
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		navigation?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		locked = false,
		regionHeader = '',
		regionContent = '',
		regionNavigation = '',
		state = getContext<NonNullable<Props['state']>>('state'),
		stepTerm = getContext<NonNullable<Props['stepTerm']>>('stepTerm'),
		gap = getContext<NonNullable<Props['gap']>>('gap'),
		justify = getContext<NonNullable<Props['justify']>>('justify'),
		onNext = getContext<NonNullable<Props['onNext']>>('onNext'),
		onBack = getContext<NonNullable<Props['onBack']>>('onBack'),
		onComplete = getContext<NonNullable<Props['onComplete']>>('onComplete'),
		buttonBack = getContext<NonNullable<Props['buttonBack']>>('buttonBack'),
		buttonBackType = getContext<NonNullable<Props['buttonBackType']>>('buttonBackType'),
		buttonBackLabel = getContext<NonNullable<Props['buttonBackLabel']>>('buttonBackLabel'),
		buttonNext = getContext<NonNullable<Props['buttonNext']>>('buttonNext'),
		buttonNextType = getContext<NonNullable<Props['buttonNextType']>>('buttonNextType'),
		buttonNextLabel = getContext<NonNullable<Props['buttonNextLabel']>>('buttonNextLabel'),
		buttonComplete = getContext<NonNullable<Props['buttonComplete']>>('buttonComplete'),
		buttonCompleteType = getContext<NonNullable<Props['buttonCompleteType']>>('buttonCompleteType'),
		buttonCompleteLabel = getContext<NonNullable<Props['buttonCompleteLabel']>>('buttonCompleteLabel'),
		transitions = getContext<NonNullable<Props['transitions']>>('transitions'),
		transitionIn = getContext<NonNullable<Props['transitionIn']>>('transitionIn'),
		transitionInParams = getContext<NonNullable<Props['transitionInParams']>>('transitionInParams'),
		transitionOut = getContext<NonNullable<Props['transitionOut']>>('transitionOut'),
		transitionOutParams = getContext<NonNullable<Props['transitionOutParams']>>('transitionOutParams'),
		header,
		children,
		navigation
	}: Props = $props();

	// Register step on init (keep these paired)
	const stepIndex = $state.total;
	$state.total++;

	// Classes
	const cBase = 'space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cContent = 'space-y-4';
	const cNavigation = 'flex';

	// Reactive
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesHeader = $derived(`${cHeader} ${regionHeader}`);
	let classesContent = $derived(`${cContent} ${regionContent}`);
	let classesNavigation = $derived(`${cNavigation} ${justify} ${gap} ${regionNavigation}`);

	// Unregister step on destroy
	onDestroy(() => {
		$state.total--;
	});
</script>

{#if stepIndex === $state.current}
	<div class="step {classesBase}" data-testid="step">
		<!-- Slot: Header -->
		<header class="step-header {classesHeader}">
			{#if header}{@render header()}{:else}{stepTerm} {stepIndex + 1}{/if}
		</header>
		<!-- Slot: Default -->
		<div class="step-content {classesContent}">
			{#if children}{@render children()}{:else}({stepTerm} {stepIndex + 1} Content){/if}
		</div>
		<!-- Navigation -->
		{#if $state.total > 1}
			<div
				class="step-navigation {classesNavigation}"
				in:dynamicTransition|local={{ transition: transitionIn, params: transitionInParams, enabled: transitions }}
				out:dynamicTransition|local={{ transition: transitionOut, params: transitionOutParams, enabled: transitions }}
			>
				{#if stepIndex === 0 && navigation}
					<!-- Slot: Navigation -->
					<div class="step-navigation-slot">
						{@render navigation?.()}
					</div>
				{:else}
					<!-- Button: Back -->
					<button type={buttonBackType} class="btn {buttonBack}" onclick={() => onBack(stepIndex)} disabled={$state.current === 0}>
						{@html buttonBackLabel}
					</button>
				{/if}
				{#if stepIndex < $state.total - 1}
					<!-- Button: Next -->
					<button type={buttonNextType} class="btn {buttonNext}" onclick={() => onNext(locked, stepIndex)} disabled={locked}>
						{#if locked}
							<svg class="w-3 aspect-square fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
								<path
									d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"
								/>
							</svg>
						{/if}
						<span>{@html buttonNextLabel}</span>
					</button>
				{:else}
					<!-- Button: Complete -->
					<button type={buttonCompleteType} class="btn {buttonComplete}" onclick={() => onComplete(stepIndex)} disabled={locked}>
						{@html buttonCompleteLabel}
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
