<script lang="ts">
	// Slots
	/** @slot header - Insert fixed header content, such as Skeleton's App Bar component. @slot sidebarLeft - Hidden when empty. Allows you to set fixed left sidebar content. @slot sidebarRight - Hidden when empty. Allows you to set fixed right sidebar content. @slot pageHeader - Insert content that resides above your page content. Great for global alerts. @slot pageFooter - Insert content that resides below your page content. Recommended for most layouts. @slot footer - Insert fixed footer content. Not recommended for most layouts. */

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// interface $$Events {
	// 	scroll: SvelteEvent<UIEvent, HTMLDivElement>;
	// }

	// Props (regions)

	interface Props {
		class?: string;
		onscroll?: ((event: Event) => void) | undefined;
		/** Set `scrollbar-gutter` style. */
		scrollbarGutter?: string;
		/** Apply arbitrary classes to the entire `#page` region. */
		regionPage?: CssClasses;
		/** Apply arbitrary classes to the `header` slot container element */
		slotHeader?: CssClasses;
		/** Apply arbitrary classes to the `sidebarLeft` slot container element */
		slotSidebarLeft?: CssClasses;
		/** Apply arbitrary classes to the `sidebarRight` slot container element */
		slotSidebarRight?: CssClasses;
		/** Apply arbitrary classes to the `pageHeader` slot container element */
		slotPageHeader?: CssClasses;
		/** Apply arbitrary classes to the `pageContent` slot container element */
		slotPageContent?: CssClasses;
		/** Apply arbitrary classes to the `pageFooter` slot container element */
		slotPageFooter?: CssClasses;
		/** Apply arbitrary classes to the `footer` slot container element */
		slotFooter?: CssClasses;
		header?: import('svelte').Snippet;
		sidebarLeft?: import('svelte').Snippet;
		pageHeader?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		pageFooter?: import('svelte').Snippet;
		sidebarRight?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		onscroll = undefined,
		scrollbarGutter = 'auto',
		regionPage = '',
		slotHeader = 'z-10',
		slotSidebarLeft = 'w-auto',
		slotSidebarRight = 'w-auto',
		slotPageHeader = '',
		slotPageContent = '',
		slotPageFooter = '',
		slotFooter = '',
		header,
		sidebarLeft,
		pageHeader,
		children,
		pageFooter,
		sidebarRight,
		footer
	}: Props = $props();

	// Base Classes
	const cBaseAppShell = 'w-full h-full flex flex-col overflow-hidden';
	const cContentArea = 'w-full h-full flex overflow-hidden';
	const cPage = 'flex-1 overflow-x-hidden flex flex-col';
	const cSidebarLeft = 'flex-none overflow-x-hidden overflow-y-auto';
	const cSidebarRight = 'flex-none overflow-x-hidden overflow-y-auto';

	// Reactive Classes
	let classesBase = $derived(`${cBaseAppShell} ${className ?? ''}`);
	let classesHeader = $derived(`${slotHeader}`);
	let classesSidebarLeft = $derived(`${cSidebarLeft} ${slotSidebarLeft}`);
	let classesSidebarRight = $derived(`${cSidebarRight} ${slotSidebarRight}`);
	let classesPageHeader = $derived(`${slotPageHeader}`);
	let classesPageContent = $derived(`${slotPageContent}`);
	let classesPageFooter = $derived(`${slotPageFooter}`);
	let classesFooter = $derived(`${slotFooter}`);
</script>

<div id="appShell" class={classesBase} data-testid="app-shell">
	<!-- Slot: Header -->
	{#if header}
		<header id="shell-header" class="flex-none {classesHeader}">{@render header?.()}</header>
	{/if}

	<!-- Content Area -->
	<div class="flex-auto {cContentArea}">
		<!-- Slot: Sidebar (left) -->
		{#if sidebarLeft}
			<aside id="sidebar-left" class={classesSidebarLeft}>{@render sidebarLeft?.()}</aside>
		{/if}

		<!-- Page -->
		<div id="page" class="{regionPage} {cPage}" style:scrollbar-gutter={scrollbarGutter} onscroll={(event) => onscroll?.(event)}>
			<!-- Slot: Page Header -->
			{#if pageHeader}
				<header id="page-header" class="flex-none {classesPageHeader}">
					{#if pageHeader}{@render pageHeader()}{:else}(slot:header){/if}
				</header>
			{/if}

			<!-- Slot: Page Content (default) -->
			<main id="page-content" class="flex-auto {classesPageContent}">{@render children?.()}</main>

			<!-- Slot: Page Footer -->
			{#if pageFooter}
				<footer id="page-footer" class="flex-none {classesPageFooter}">
					{#if pageFooter}{@render pageFooter()}{:else}(slot:footer){/if}
				</footer>
			{/if}
		</div>

		<!-- Slot: Sidebar (right) -->
		{#if sidebarRight}
			<aside id="sidebar-right" class={classesSidebarRight}>{@render sidebarRight?.()}</aside>
		{/if}
	</div>

	<!-- Slot: footer -->
	{#if footer}
		<footer id="shell-footer" class="flex-none {classesFooter}">{@render footer?.()}</footer>
	{/if}
</div>
