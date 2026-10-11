<script lang="ts" module>
	import { fly, fade } from 'svelte/transition';
	import { type Transition, type TransitionParams, prefersReducedMotionStore } from '../../index.js';
	import { dynamicTransition } from '../../internal/transitions.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type FlyTransition = typeof fly;
	type TransitionIn = Transition;
	type TransitionOut = Transition;
</script>

<script lang="ts" generics="TransitionIn extends Transition = FlyTransition, TransitionOut extends Transition = FlyTransition">
	// Event Dispatcher
	type ModalEvent = {
		backdrop: MouseEvent;
	};

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	import { focusTrap } from '../../actions/FocusTrap/focusTrap.js';
	import { getModalStore } from './stores.js';
	import type { ModalComponent, ModalSettings } from './types.js';

	// Props (transition)

	interface Props {
		class?: string;
		onbackdrop?: ((event: ModalEvent['backdrop']) => void) | undefined;
		ontouchstart?: ((event: TouchEvent) => void) | undefined;
		ontouchend?: ((event: TouchEvent) => void) | undefined;
		/** Register a list of reusable component modals. */
		components?: Record<string, ModalComponent>;
		/** Set the modal position within the backdrop container */
		position?: CssClasses;
		/** Provide classes to style the modal background. */
		background?: CssClasses;
		/** Provide classes to style the modal width. */
		width?: CssClasses;
		/** Provide classes to style the modal height. */
		height?: CssClasses;
		/** Provide classes to style the modal padding. */
		padding?: CssClasses;
		/** Provide classes to style the modal spacing. */
		spacing?: CssClasses;
		/** Provide classes to style the modal border radius. */
		rounded?: CssClasses;
		/** Provide classes to style modal box shadow. */
		shadow?: CssClasses;
		/** Provide a class to override the z-index */
		zIndex?: CssClasses;
		/** Provide classes for neutral buttons, such as Cancel. */
		buttonNeutral?: CssClasses;
		/** Provide classes for positive actions, such as Confirm or Submit. */
		buttonPositive?: CssClasses;
		/** Override the text for the Cancel button. */
		buttonTextCancel?: CssClasses;
		/** Override the text for the Confirm button. */
		buttonTextConfirm?: CssClasses;
		/** Override the text for the Submit button. */
		buttonTextSubmit?: CssClasses;
		/** Provide arbitrary classes to the backdrop region. */
		regionBackdrop?: CssClasses;
		/** Provide arbitrary classes to modal header region. */
		regionHeader?: CssClasses;
		/** Provide arbitrary classes to modal body region. */
		regionBody?: CssClasses;
		/** Provide arbitrary classes to modal footer region. */
		regionFooter?: CssClasses;
		/** Enable/Disable transitions */
		transitions?: boolean;
		/** Provide the transition used on entry. */
		transitionIn?: TransitionIn;
		/** Transition params provided to `TransitionIn`. */
		transitionInParams?: TransitionParams<TransitionIn>;
		/** Provide the transition used on exit. */
		transitionOut?: TransitionOut;
		/** Transition params provided to `TransitionOut`. */
		transitionOutParams?: TransitionParams<TransitionOut>;
	}

	let {
		class: className = '',
		onbackdrop = undefined,
		ontouchstart = undefined,
		ontouchend = undefined,
		components = {},
		position = 'items-center',
		background = 'bg-surface-100-800-token',
		width = 'w-modal',
		height = 'h-auto',
		padding = 'p-4',
		spacing = 'space-y-4',
		rounded = 'rounded-container-token',
		shadow = 'shadow-xl',
		zIndex = 'z-[999]',
		buttonNeutral = 'variant-ghost-surface',
		buttonPositive = 'variant-filled',
		buttonTextCancel = $bindable('Cancel'),
		buttonTextConfirm = $bindable('Confirm'),
		buttonTextSubmit = $bindable('Submit'),
		regionBackdrop = '',
		regionHeader = 'text-2xl font-bold',
		regionBody = 'max-h-[200px] overflow-hidden',
		regionFooter = 'flex justify-end space-x-2',
		transitions = !$prefersReducedMotionStore,
		transitionIn = fly as TransitionIn,
		transitionInParams = { duration: 150, opacity: 0, x: 0, y: 100 },
		transitionOut = fly as TransitionOut,
		transitionOutParams = { duration: 150, opacity: 0, x: 0, y: 100 }
	}: Props = $props();

	// Base Styles
	const cBackdrop = 'fixed top-0 left-0 right-0 bottom-0 bg-surface-backdrop-token p-4';
	const cTransitionLayer = 'w-full h-fit min-h-full overflow-y-auto flex justify-center';
	const cModal = 'block overflow-y-auto'; // max-h-full overflow-y-auto overflow-x-hidden
	const cModalImage = 'w-full h-auto';

	// Local
	let registeredInteractionWithBackdrop = false;
	let modalElement = $state<HTMLDivElement>();
	let windowHeight = $state(0);
	let backdropOverflow = $state('overflow-y-hidden');

	const modalStore = getModalStore();

	let currentModal = $derived($modalStore[0]);
	let currentComponent = $derived(
		typeof currentModal?.component === 'string' ? components[currentModal.component] : currentModal?.component
	);
	let promptValue = $derived(currentModal?.type === 'prompt' ? currentModal.value : '');
	let cancelText = $derived(currentModal?.buttonTextCancel || buttonTextCancel);
	let confirmText = $derived(currentModal?.buttonTextConfirm || buttonTextConfirm);
	let submitText = $derived(currentModal?.buttonTextSubmit || buttonTextSubmit);

	function onModalHeightChange(modal: HTMLDivElement | undefined) {
		let modalHeight = modal?.clientHeight;
		if (!modalHeight) modalHeight = (modal?.firstChild as HTMLElement)?.clientHeight;

		// modal is closed
		if (!modalHeight) return;

		if (modalHeight > windowHeight) {
			backdropOverflow = 'overflow-y-auto';
		} else {
			backdropOverflow = 'overflow-y-hidden';
		}
	}

	// Event Handlers ---
	function onBackdropInteractionBegin(event: SvelteEvent<MouseEvent, HTMLDivElement>): void {
		if (!(event.target instanceof Element)) return;
		const classList = event.target.classList;
		if (classList.contains('modal-backdrop') || classList.contains('modal-transition')) {
			registeredInteractionWithBackdrop = true;
		}
	}
	function onBackdropInteractionEnd(event: SvelteEvent<MouseEvent, HTMLDivElement>): void {
		if (!(event.target instanceof Element)) return;
		const classList = event.target.classList;
		if ((classList.contains('modal-backdrop') || classList.contains('modal-transition')) && registeredInteractionWithBackdrop) {
			// We return `undefined` to differentiate from the cancel button
			if ($modalStore[0].response) $modalStore[0].response(undefined);
			modalStore.close();
			/** @event {{ event }} backdrop - Fires on backdrop interaction. */
			onbackdrop?.(event);
		}
		registeredInteractionWithBackdrop = false;
	}

	function onClose(): void {
		if ($modalStore[0].response) $modalStore[0].response(false);
		modalStore.close();
	}

	function onConfirm(): void {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	function onPromptSubmit(event: SvelteEvent<SubmitEvent, HTMLFormElement>): void {
		event.preventDefault();
		if ($modalStore[0].response) {
			if ($modalStore[0].valueAttr !== undefined && 'type' in $modalStore[0].valueAttr && $modalStore[0].valueAttr.type === 'number')
				$modalStore[0].response(parseInt(promptValue));
			else $modalStore[0].response(promptValue);
		}
		modalStore.close();
	}

	// A11y ---

	function onKeyDown(event: SvelteEvent<KeyboardEvent, Window>): void {
		if (!$modalStore.length) return;
		if (event.code === 'Escape') onClose();
	}

	// first child of the modal is the content.
	$effect(() => {
		onModalHeightChange(modalElement);
	});
	// State
	let cPosition = $derived($modalStore[0]?.position ?? position);
	// Reactive
	let classesBackdrop = $derived(`${cBackdrop} ${regionBackdrop} ${zIndex} ${className ?? ''} ${$modalStore[0]?.backdropClasses ?? ''}`);
	let classesTransitionLayer = $derived(`${cTransitionLayer} ${cPosition ?? ''}`);
	let classesModal = $derived(
		`${cModal} ${background} ${width} ${height} ${padding} ${spacing} ${rounded} ${shadow} ${$modalStore[0]?.modalClasses ?? ''}`
	);
	// IMPORTANT: add values to pass to the children templates.
	// There is a way to self-reference component values, but it involves svelte-internal and is not yet stable.
	// REPL: https://svelte.dev/repl/badd0f11aa99450ca69dca6690d4d5a4?version=3.52.0
	// Source: https://discord.com/channels/457912077277855764/1037768846855118909
	let parent = $derived({
		position,
		// ---
		background,
		width,
		height,
		padding,
		spacing,
		rounded,
		shadow,
		// ---
		buttonNeutral,
		buttonPositive,
		buttonTextCancel: cancelText,
		buttonTextConfirm: confirmText,
		buttonTextSubmit: submitText,
		// ---
		regionBackdrop,
		regionHeader,
		regionBody,
		regionFooter,
		// ---
		onClose
	});
</script>

<svelte:window bind:innerHeight={windowHeight} onkeydown={onKeyDown} />

{#if $modalStore.length > 0}
	{#key $modalStore}
		<!-- Backdrop -->
		<!-- FIXME: resolve a11y warnings -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-backdrop {classesBackdrop} {backdropOverflow}"
			data-testid="modal-backdrop"
			onmousedown={onBackdropInteractionBegin}
			onmouseup={onBackdropInteractionEnd}
			ontouchstart={(event) => ontouchstart?.(event)}
			ontouchend={(event) => ontouchend?.(event)}
			transition:dynamicTransition|global={{ transition: fade, params: { duration: 150 }, enabled: transitions }}
			use:focusTrap={true}
		>
			<!-- Transition Layer -->
			<div
				class="modal-transition {classesTransitionLayer}"
				in:dynamicTransition|global={{ transition: transitionIn, params: transitionInParams, enabled: transitions }}
				out:dynamicTransition|global={{ transition: transitionOut, params: transitionOutParams, enabled: transitions }}
			>
				{#if $modalStore[0].type !== 'component'}
					<!-- Modal: Presets -->
					<div
						class="modal {classesModal}"
						bind:this={modalElement}
						data-testid="modal"
						role="dialog"
						aria-modal="true"
						aria-label={$modalStore[0].title ?? ''}
					>
						<!-- Header -->
						{#if $modalStore[0]?.title}
							<header class="modal-header {regionHeader}">{@html $modalStore[0].title}</header>
						{/if}
						<!-- Body -->
						{#if $modalStore[0]?.body}
							<article class="modal-body {regionBody}">{@html $modalStore[0].body}</article>
						{/if}
						<!-- Image -->
						{#if $modalStore[0]?.image && typeof $modalStore[0]?.image === 'string'}
							<img class="modal-image {cModalImage}" src={$modalStore[0]?.image} alt="Modal" />
						{/if}
						<!-- Type -->
						{#if $modalStore[0].type === 'alert'}
							<!-- Template: Alert -->
							<footer class="modal-footer {regionFooter}">
								<button type="button" class="btn {buttonNeutral}" onclick={onClose}>{cancelText}</button>
							</footer>
						{:else if $modalStore[0].type === 'confirm'}
							<!-- Template: Confirm -->
							<footer class="modal-footer {regionFooter}">
								<button type="button" class="btn {buttonNeutral}" onclick={onClose}>{cancelText}</button>
								<button type="button" class="btn {buttonPositive}" onclick={onConfirm}>{confirmText}</button>
							</footer>
						{:else if $modalStore[0].type === 'prompt'}
							<!-- Template: Prompt -->
							<form class="space-y-4" onsubmit={onPromptSubmit}>
								<input class="modal-prompt-input input" name="prompt" type="text" bind:value={promptValue} {...$modalStore[0].valueAttr} />
								<footer class="modal-footer {regionFooter}">
									<button type="button" class="btn {buttonNeutral}" onclick={onClose}>{cancelText}</button>
									<button type="submit" class="btn {buttonPositive}">{submitText}</button>
								</footer>
							</form>
						{/if}
					</div>
				{:else}
					<!-- Modal: Components -->
					<!-- Note: keep `contents` class to allow widths from children -->
					<div
						bind:this={modalElement}
						class="modal contents {$modalStore[0]?.modalClasses ?? ''}"
						data-testid="modal-component"
						role="dialog"
						aria-modal="true"
						aria-label={$modalStore[0].title ?? ''}
					>
						{#if currentComponent?.slot}
							{@const SvelteComponent = currentComponent?.ref}
							<SvelteComponent {...currentComponent?.props} {parent}>
								{@html currentComponent?.slot}
							</SvelteComponent>
						{:else}
							{@const SvelteComponent_1 = currentComponent?.ref}
							<SvelteComponent_1 {...currentComponent?.props} {parent} />
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/key}
{/if}
