<script lang="ts">
	import { BROWSER } from 'esm-env';

	// Event Dispatcher
	type DrawerEvent = {
		backdrop: MouseEvent;
		drawer: MouseEvent;
	};

	// Types
	import { type CssClasses, type SvelteEvent, prefersReducedMotionStore } from '../../index.js';

	// Actions
	import { focusTrap } from '../../actions/FocusTrap/focusTrap.js';

	// Drawer Utils
	import type { DrawerSettings } from './types.js';
	import { getDrawerStore } from './stores.js';
	import { fade, fly } from 'svelte/transition';
	import { dynamicTransition } from '../../internal/transitions.js';
	import { cubicIn } from 'svelte/easing';

	// Props (transition)

	interface Props {
		class?: string;
		onbackdrop?: ((event: DrawerEvent['backdrop']) => void) | undefined;
		ondrawer?: ((event: DrawerEvent['drawer']) => void) | undefined;
		ontouchstart?: ((event: TouchEvent) => void) | undefined;
		ontouchend?: ((event: TouchEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		/** Set the anchor position. */
		position?: 'left' | 'top' | 'right' | 'bottom';
		/** Drawer - Provide classes to set the drawer background color. */
		bgDrawer?: CssClasses;
		/** Drawer - Provide classes to set border color. */
		border?: CssClasses;
		/** Drawer - Provide classes to set border radius. */
		rounded?: CssClasses;
		/** Drawer - Provide classes to set the box shadow. */
		shadow?: CssClasses;
		/** Drawer - Provide classes to override the width. */
		width?: CssClasses;
		/** Drawer - Provide classes to override the height. */
		height?: CssClasses;
		/** Backdrop - Provide classes to set the backdrop background color */
		bgBackdrop?: CssClasses;
		/** Backdrop - Provide classes to set the blur style. */
		blur?: CssClasses;
		/** Backdrop - Provide classes to set padding. */
		padding?: CssClasses;
		/** Backdrop - Provide a class to override the z-index */
		zIndex?: CssClasses;
		/** Provide arbitrary classes to the backdrop region. */
		regionBackdrop?: CssClasses;
		/** Provide arbitrary classes to the drawer region. */
		regionDrawer?: CssClasses;
		/** Provide an ID of the element labeling the drawer. */
		labelledby?: string;
		/** Provide an ID of the element describing the drawer. */
		describedby?: string;
		/** Set the transition duration in milliseconds. */
		duration?: number;
		/** Enable/Disable transitions */
		transitions?: boolean;
		/** Enable/Disable opacity transition of Drawer */
		opacityTransition?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		onbackdrop = undefined,
		ondrawer = undefined,
		ontouchstart = undefined,
		ontouchend = undefined,
		onkeypress = undefined,
		position = $bindable('left'),
		bgDrawer = $bindable('bg-surface-100-800-token'),
		border = $bindable(''),
		rounded = $bindable(''),
		shadow = $bindable('shadow-xl'),
		width = $bindable(''),
		height = $bindable(''),
		bgBackdrop = $bindable('bg-surface-backdrop-token'),
		blur = $bindable(''),
		padding = $bindable(''),
		zIndex = 'z-40',
		regionBackdrop = $bindable(''),
		regionDrawer = $bindable(''),
		labelledby = $bindable(''),
		describedby = $bindable(''),
		duration = $bindable(200),
		transitions = !$prefersReducedMotionStore,
		opacityTransition = $bindable(true),
		children
	}: Props = $props();

	// Presets
	// prettier-ignore
	const presets = {
		top: { alignment: 'items-start', width: 'w-full', height: 'h-[50%]', rounded: 'rounded-bl-container-token rounded-br-container-token' },
		bottom: { alignment: 'items-end', width: 'w-full', height: ' h-[50%]', rounded: 'rounded-tl-container-token rounded-tr-container-token' },
		left: { alignment: 'justify-start', width: 'w-[90%]', height: 'h-full', rounded: 'rounded-tr-container-token rounded-br-container-token' },
		right: { alignment: 'justify-end', width: 'w-[90%]', height: 'h-full', rounded: 'rounded-tl-container-token rounded-bl-container-token' }
	};

	// Local
	let elemBackdrop = $state<HTMLElement>();
	let elemDrawer = $state<HTMLElement>();
	let anim = $state({ x: 0, y: 0 });
	const drawerStore = getDrawerStore();

	// Classes
	const cBackdrop = 'fixed top-0 left-0 right-0 bottom-0 flex';
	const cDrawer = 'overflow-y-auto transition-transform';

	// Record a record of default props on init
	// NOTE: these must stay in sync with the props implemented above.
	// prettier-ignore
	const propDefaults = {
		position,
		bgBackdrop, blur, padding,
		bgDrawer, border, rounded, shadow,
		width, height, opacityTransition,
		regionBackdrop, regionDrawer,
		labelledby, describedby,
		duration
	};

	// Override provided props, else restore prop defaults
	// NOTE: these must stay in sync with the props implemented above.
	function applyPropSettings(settings: DrawerSettings): void {
		position = settings.position || propDefaults.position;

		// Backdrop
		bgBackdrop = settings.bgBackdrop || propDefaults.bgBackdrop;
		blur = settings.blur || propDefaults.blur;
		padding = settings.padding || propDefaults.padding;
		// Drawer
		bgDrawer = settings.bgDrawer || propDefaults.bgDrawer;
		border = settings.border || propDefaults.border;
		rounded = settings.rounded || propDefaults.rounded;
		shadow = settings.shadow || propDefaults.shadow;
		width = settings.width || propDefaults.width;
		height = settings.height || propDefaults.height;
		// Regions
		regionBackdrop = settings.regionBackdrop || propDefaults.regionBackdrop;
		regionDrawer = settings.regionDrawer || propDefaults.regionDrawer;
		// A11y
		labelledby = settings.labelledby || propDefaults.labelledby;
		describedby = settings.describedby || propDefaults.describedby;
		// Transitions
		opacityTransition = settings.opacityTransition || propDefaults.opacityTransition;
		duration = settings.duration || propDefaults.duration;
	}

	function applyAnimationSettings(): void {
		if (!BROWSER) return;
		// prettier-ignore
		switch (position) {
			case 'top':    anim = { x: 0, y: -window.innerWidth }; break;
			case 'bottom': anim = { x: 0, y: window.innerWidth }; break;
			case 'left':   anim = { x: -window.innerHeight, y: 0 }; break;
			case 'right':  anim = { x: window.innerHeight, y: 0 }; break;
			default: console.error('Error: unknown position property value.'); break;
		}
	}

	// Input Handlers
	function onDrawerInteraction(event: SvelteEvent<MouseEvent, HTMLDivElement>): void {
		if (event.target === elemBackdrop) {
			drawerStore.close();
			/** @event {{ event }} backdrop - Fires on backdrop interaction. */
			onbackdrop?.(event);
		} else {
			/** @event {{ event }} drawer - Fires on drawer interaction. */
			ondrawer?.(event);
		}
	}
	function onKeydownWindow(event: SvelteEvent<KeyboardEvent, Window>): void {
		if (!$drawerStore) return;
		if (event.code === 'Escape') drawerStore.close();
	}

	// Drawer Subscription
	drawerStore.subscribe((settings: DrawerSettings) => {
		if (settings.open !== true) return;
		applyPropSettings(settings);
		applyAnimationSettings();
	});

	// Dynamic Styles
	let classesPosition = $derived(presets[position].alignment);
	let classesWidth = $derived(width ? width : presets[position].width);
	let classesHeight = $derived(height ? height : presets[position].height);
	let classesRounded = $derived(rounded ? rounded : presets[position].rounded);
	// Reactive
	let classesBackdrop = $derived(
		`${cBackdrop} ${bgBackdrop} ${padding} ${blur} ${classesPosition} ${regionBackdrop} ${zIndex} ${className ?? ''}`
	);
	let classesDrawer = $derived(
		`${cDrawer} ${bgDrawer} ${border} ${rounded} ${shadow} ${classesWidth} ${classesHeight} ${classesRounded} ${regionDrawer}`
	);
</script>

<svelte:window onkeydown={onKeydownWindow} />

{#if $drawerStore.open === true}
	<!-- Backdrop -->
	<!-- FIXME: resolve a11y warnings -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={elemBackdrop}
		class="drawer-backdrop {classesBackdrop}"
		data-testid="drawer-backdrop"
		onmousedown={onDrawerInteraction}
		ontouchstart={(event) => ontouchstart?.(event)}
		ontouchend={(event) => ontouchend?.(event)}
		onkeypress={(event) => onkeypress?.(event)}
		in:dynamicTransition|local={{
			transition: fade,
			params: { duration },
			enabled: transitions && opacityTransition
		}}
		out:dynamicTransition|local={{
			transition: fade,
			params: { duration },
			enabled: transitions && opacityTransition
		}}
		use:focusTrap={true}
	>
		<!-- Drawer -->
		<!-- separate In/Out so anim values update -->
		<div
			bind:this={elemDrawer}
			class="drawer {classesDrawer}"
			data-testid="drawer"
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledby}
			aria-describedby={describedby}
			in:dynamicTransition|local={{
				transition: fly,
				params: { x: anim.x, y: anim.y, duration, opacity: opacityTransition ? undefined : 1 },
				enabled: transitions
			}}
			out:dynamicTransition|local={{
				transition: fly,
				params: { x: anim.x, y: anim.y, duration, opacity: opacityTransition ? undefined : 1, easing: cubicIn },
				enabled: transitions
			}}
		>
			<!-- Slot: Default -->
			{@render children?.()}
		</div>
	</div>
{/if}
