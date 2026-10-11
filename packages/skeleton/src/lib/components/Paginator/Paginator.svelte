<script lang="ts">
	import { untrack } from 'svelte';
	// Types
	import type { PaginationSettings } from './types.js';
	import type { CssClasses } from '../../index.js';
	import { leftAngles, leftArrow, rightAngles, rightArrow } from './icons.js';

	// Event Dispatcher
	type PaginatorEvent = {
		amount: number;
		page: number;
	};

	// Props (A11y)

	interface Props {
		class?: string;
		onamount?: ((event: PaginatorEvent['amount']) => void) | undefined;
		onpage?: ((event: PaginatorEvent['page']) => void) | undefined;
		/** Pass the page setting object. */
		settings?: PaginationSettings;
		/** Sets selection and buttons to disabled state on-demand. */
		disabled?: boolean;
		/** Show Previous and Next buttons. */
		showPreviousNextButtons?: boolean;
		/** Show First and Last buttons. */
		showFirstLastButtons?: boolean;
		/** Displays a numeric row of page buttons. */
		showNumerals?: boolean;
		/** Maximum number of active page siblings in the numeric row. */
		maxNumerals?: number;
		/** Provide classes to set flexbox justification. */
		justify?: CssClasses;
		/** Provide classes to style the select input. */
		select?: CssClasses;
		/** Set the text for the amount selection input. */
		amountText?: string;
		/** Set the base classes for the control element. */
		regionControl?: CssClasses;
		/** Provide variant style for the control button group. */
		controlVariant?: CssClasses;
		/** Provide separator style for the control button group. */
		controlSeparator?: CssClasses;
		/** Provide arbitrary classes to the active page buttons. */
		active?: CssClasses;
		/** Set the base button classes. */
		buttonClasses?: CssClasses;
		/** Set the label for the Previous button. */
		buttonTextPrevious?: CssClasses;
		/** Set the label for the Next button. */
		buttonTextNext?: CssClasses;
		/** Set the label for the First button. */
		buttonTextFirst?: CssClasses;
		/** Set the label for the Last button. */
		buttonTextLast?: CssClasses;
		/** Set the label for the pages separator. */
		separatorText?: string;
		/** Provide the ARIA label for the First page button. */
		labelFirst?: string;
		/** Provide the ARIA label for the Previous page button. */
		labelPrevious?: string;
		/** Provide the ARIA label for the Next page button. */
		labelNext?: string;
		/** Provide the ARIA label for the Last page button. */
		labelLast?: string;
	}

	let {
		class: className = '',
		onamount = undefined,
		onpage = undefined,
		settings = $bindable({ page: 0, limit: 5, size: 0, amounts: [1, 2, 5, 10] }),
		disabled = false,
		showPreviousNextButtons = true,
		showFirstLastButtons = false,
		showNumerals = false,
		maxNumerals = 1,
		justify = 'justify-between',
		select = 'select min-w-[150px]',
		amountText = 'Items',
		regionControl = 'btn-group',
		controlVariant = 'variant-filled',
		controlSeparator = '',
		active = 'variant-filled-primary',
		buttonClasses = '!px-3 !py-1.5 fill-current',
		buttonTextPrevious = leftArrow,
		buttonTextNext = rightArrow,
		buttonTextFirst = leftAngles,
		buttonTextLast = rightAngles,
		separatorText = 'of',
		labelFirst = 'First page',
		labelPrevious = 'Previous page',
		labelNext = 'Next page',
		labelLast = 'Last page'
	}: Props = $props();

	// Base Classes
	const cBase = 'flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4';
	const cLabel = 'w-full md:w-auto';

	// Local
	let lastPage = $derived(Math.max(0, Math.ceil(settings.size / settings.limit - 1)));
	let controlPages = $derived(getNumerals());

	function onChangeLength(): void {
		/** @event {{ length: number }} amount - Fires when the amount selection input changes. */
		onamount?.(settings.limit);

		// ensure page in limit range
		if (settings.page > lastPage) {
			settings.page = lastPage;
		}
	}

	function gotoPage(page: number) {
		if (page < 0) return;

		settings.page = page;
		/** @event {{ page: number }} page Fires when the next/back buttons are pressed. */
		onpage?.(settings.page);
	}

	// Full row - no ellipsis
	function getFullNumerals() {
		const pages = [];
		for (let index = 0; index <= lastPage; index++) {
			pages.push(index);
		}
		return pages;
	}

	function getNumerals() {
		const pages = [];
		const isWithinLeftSection = settings.page < maxNumerals + 2;
		const isWithinRightSection = settings.page > lastPage - (maxNumerals + 2);

		if (lastPage <= maxNumerals * 2 + 1) return getFullNumerals();

		pages.push(0);
		if (!isWithinLeftSection) pages.push(-1);

		if (isWithinLeftSection || isWithinRightSection) {
			// mid section - with only one ellipsis
			const sectionStart = isWithinLeftSection ? 1 : lastPage - (maxNumerals + 2);
			const sectionEnd = isWithinRightSection ? lastPage - 1 : maxNumerals + 2;
			for (let i = sectionStart; i <= sectionEnd; i++) {
				pages.push(i);
			}
		} else {
			// mid section - with both ellipses
			for (let i = settings.page - maxNumerals; i <= settings.page + maxNumerals; i++) {
				pages.push(i);
			}
		}

		if (!isWithinRightSection) pages.push(-1);
		pages.push(lastPage);

		return pages;
	}

	// State
	let classesButtonActive = $derived((page: number) => {
		return page === settings.page ? `${active} pointer-events-none` : '';
	});
	$effect.pre(() => {
		if (settings.page > lastPage) settings.page = lastPage;
	});
	$effect.pre(() => {
		maxNumerals;
		untrack(onChangeLength);
	});

	// Reactive Classes
	let classesBase = $derived(`${cBase} ${justify} ${className ?? ''}`);
	let classesLabel = $derived(`${cLabel}`);
	let classesSelect = $derived(`${select}`);
	let classesControls = $derived(`${regionControl} ${controlVariant} ${controlSeparator}`);
</script>

<div class="paginator {classesBase}" data-testid="paginator">
	<!-- Select Amount -->
	{#if settings.amounts.length}
		<label class="paginator-label {classesLabel}">
			<select
				bind:value={settings.limit}
				onchange={onChangeLength}
				class="paginator-select {classesSelect}"
				{disabled}
				aria-label="Select Amount"
			>
				{#each settings.amounts as amount}<option value={amount}>{amount} {amountText}</option>{/each}
			</select>
		</label>
	{/if}
	<!-- Controls -->
	<div class="paginator-controls {classesControls}">
		<!-- Button: First -->
		{#if showFirstLastButtons}
			<button
				type="button"
				aria-label={labelFirst}
				class={buttonClasses}
				onclick={() => {
					gotoPage(0);
				}}
				disabled={disabled || settings.page === 0}
			>
				{@html buttonTextFirst}
			</button>
		{/if}
		<!-- Button: Back -->
		{#if showPreviousNextButtons}
			<button
				type="button"
				aria-label={labelPrevious}
				class={buttonClasses}
				onclick={() => {
					gotoPage(settings.page - 1);
				}}
				disabled={disabled || settings.page === 0}
			>
				{@html buttonTextPrevious}
			</button>
		{/if}
		<!-- Center -->
		{#if showNumerals === false}
			<!-- Details -->
			<button type="button" class="{buttonClasses} pointer-events-none !text-sm">
				{settings.page * settings.limit + 1}-{Math.min(settings.page * settings.limit + settings.limit, settings.size)}&nbsp;<span
					class="opacity-50">{separatorText} {settings.size}</span
				>
			</button>
		{:else}
			<!-- Numeric Row -->
			{#each controlPages as page}
				<button type="button" {disabled} class="{buttonClasses} {classesButtonActive(page)}" onclick={() => gotoPage(page)}>
					{page >= 0 ? page + 1 : '...'}
				</button>
			{/each}
		{/if}
		<!-- Button: Next -->
		{#if showPreviousNextButtons}
			<button
				type="button"
				aria-label={labelNext}
				class={buttonClasses}
				onclick={() => {
					gotoPage(settings.page + 1);
				}}
				disabled={disabled || (settings.page + 1) * settings.limit >= settings.size}
			>
				{@html buttonTextNext}
			</button>
		{/if}
		<!-- Button: last -->
		{#if showFirstLastButtons}
			<button
				type="button"
				aria-label={labelLast}
				class={buttonClasses}
				onclick={() => {
					gotoPage(lastPage);
				}}
				disabled={disabled || (settings.page + 1) * settings.limit >= settings.size}
			>
				{@html buttonTextLast}
			</button>
		{/if}
	</div>
</div>
