<script lang="ts" module>
	import { fly } from 'svelte/transition';
	import { type Transition, type TransitionParams, type CssClasses, prefersReducedMotionStore } from '../../index.js';
	import { dynamicTransition } from '../../internal/transitions.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type FlyTransition = typeof fly;
	type TransitionIn = Transition;
	type TransitionOut = Transition;
</script>

<script lang="ts" generics="TransitionIn extends Transition = FlyTransition, TransitionOut extends Transition = FlyTransition">
	import { flip } from 'svelte/animate';

	// Stores
	import { getToastStore } from './stores.js';
	const toastStore = getToastStore();

	// Props (transition)

	interface Props {
		class?: string;
		/** Set the toast position. */
		position?: 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br';
		/** Maximum toasts that can show at once. */
		max?: number;
		/** Provide classes to set the background color. */
		background?: CssClasses;
		/** Provide classes to set width styles. */
		width?: CssClasses;
		/** Provide classes to set the text color. */
		color?: CssClasses;
		/** Provide classes to set the padding. */
		padding?: CssClasses;
		/** Provide classes to set toast horizontal spacing. */
		spacing?: CssClasses;
		/** Provide classes to set the border radius styles. */
		rounded?: CssClasses;
		/** Provide classes to set the border box shadow. */
		shadow?: CssClasses;
		/** Provide a class to override the z-index */
		zIndex?: CssClasses;
		/** Provide styles for the action button. */
		buttonAction?: CssClasses;
		/** Provide styles for the dismiss button. */
		buttonDismiss?: CssClasses;
		/** The button label text. */
		buttonDismissLabel?: string;
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
	}

	let {
		class: className = '',
		position = 'b',
		max = 3,
		background = 'variant-filled-secondary',
		width = 'max-w-[640px]',
		color = '',
		padding = 'p-4',
		spacing = 'space-x-4',
		rounded = 'rounded-container-token',
		shadow = 'shadow-lg',
		zIndex = 'z-[888]',
		buttonAction = 'btn variant-filled',
		buttonDismiss = 'btn-icon btn-icon-sm variant-filled',
		buttonDismissLabel = '✕',
		transitions = !$prefersReducedMotionStore,
		transitionIn = fly as TransitionIn,
		transitionInParams = { duration: 250 },
		transitionOut = fly as TransitionOut,
		transitionOutParams = { duration: 250 }
	}: Props = $props();

	// Base Classes
	const cWrapper = 'flex fixed top-0 left-0 right-0 bottom-0 pointer-events-none';
	const cSnackbar = 'flex flex-col gap-y-2';
	const cToast = 'flex justify-between items-center pointer-events-auto';
	const cToastActions = 'flex items-center space-x-2';

	// Local
	let layout = $derived.by(() => {
		switch (position) {
			case 't':
				return { position: 'justify-center items-start', align: 'items-center', axis: { x: 0, y: -100 } };
			case 'b':
				return { position: 'justify-center items-end', align: 'items-center', axis: { x: 0, y: 100 } };
			case 'l':
				return { position: 'justify-start items-center', align: 'items-start', axis: { x: -100, y: 0 } };
			case 'r':
				return { position: 'justify-end items-center', align: 'items-end', axis: { x: 100, y: 0 } };
			case 'tl':
				return { position: 'justify-start items-start', align: 'items-start', axis: { x: -100, y: 0 } };
			case 'tr':
				return { position: 'justify-end items-start', align: 'items-end', axis: { x: 100, y: 0 } };
			case 'bl':
				return { position: 'justify-start items-end', align: 'items-start', axis: { x: -100, y: 0 } };
			case 'br':
				return { position: 'justify-end items-end', align: 'items-end', axis: { x: 100, y: 0 } };
		}
	});
	let cPosition = $derived(layout.position);
	let cAlign = $derived(layout.align);
	let animAxis = $derived(layout.axis);
	function onAction(index: number): void {
		$toastStore[index]?.action?.response();
		toastStore.close($toastStore[index].id);
	}

	function onMouseEnter(index: number): void {
		if ($toastStore[index]?.hoverable) {
			toastStore.freeze(index);
			classesSnackbar += ' scale-[105%]';
		}
	}

	function onMouseLeave(index: number): void {
		if ($toastStore[index]?.hoverable) {
			toastStore.unfreeze(index);
			classesSnackbar = classesSnackbar.replace(' scale-[105%]', '');
		}
	}

	let wrapperVisible = $state(false);

	// Reactive
	let classesWrapper = $derived(`${cWrapper} ${cPosition} ${zIndex} ${className || ''}`);
	let classesSnackbar = $derived(`${cSnackbar} ${cAlign} ${padding}`);
	let classesToast = $derived(`${cToast} ${width} ${color} ${padding} ${spacing} ${rounded} ${shadow}`);
	// Filtered Toast Store
	let filteredToasts = $derived(Array.from($toastStore).slice(0, max));

	$effect.pre(() => {
		if (filteredToasts.length) {
			wrapperVisible = true;
		}
	});
</script>

{#if filteredToasts.length > 0 || wrapperVisible}
	<!-- Wrapper -->
	<div class="snackbar-wrapper {classesWrapper}" data-testid="snackbar-wrapper">
		<!-- List -->
		<div class="snackbar {classesSnackbar}">
			{#each filteredToasts as t, i (t)}
				<div
					animate:flip={{ duration: transitions ? 250 : 0 }}
					in:dynamicTransition|global={{
						transition: transitionIn,
						params: { x: animAxis.x, y: animAxis.y, ...transitionInParams },
						enabled: transitions
					}}
					out:dynamicTransition|global={{
						transition: transitionOut,
						params: { x: animAxis.x, y: animAxis.y, ...transitionOutParams },
						enabled: transitions
					}}
					onoutroend={() => {
						const outroFinishedForLastToastOnQueue = filteredToasts.length === 0;
						if (outroFinishedForLastToastOnQueue) wrapperVisible = false;
					}}
					onmouseenter={() => onMouseEnter(i)}
					onmouseleave={() => onMouseLeave(i)}
					role={t.hideDismiss ? 'alert' : 'alertdialog'}
					aria-live="polite"
				>
					<!-- Toast -->
					<div class="toast {classesToast} {t.background ?? background} {t.classes ?? ''}" data-testid="toast">
						<div class="text-base">{@html t.message}</div>
						{#if t.action || !t.hideDismiss}
							<div class="toast-actions {cToastActions}">
								{#if t.action}<button class={buttonAction} onclick={() => onAction(i)}>{@html t.action.label}</button>{/if}
								{#if !t.hideDismiss}<button class={buttonDismiss} aria-label="Dismiss toast" onclick={() => toastStore.close(t.id)}
										>{buttonDismissLabel}</button
									>{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
