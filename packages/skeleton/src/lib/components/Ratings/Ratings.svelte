<script lang="ts">
	// Slots:
	/** @slot {{}} empty - Provide an empty rating icon. @slot {{}} half - Provide a half rating icon. @slot {{}} full - Provide a full rating icon. */

	// Types
	import type { CssClasses } from '../../index.js';

	// Props (regions)

	interface Props {
		class?: string;
		onicon?: ((event: RatingsEvent['icon']) => void) | undefined;
		/** Current rating value. */
		value?: number;
		/** Maximum rating value. */
		max?: number;
		/** Enables interactive mode for each rating icon. */
		interactive?: boolean;
		/** Provide classes to set the text color. */
		text?: CssClasses;
		/** Provide classes to set the SVG fill color. */
		fill?: CssClasses;
		/** Provide classes to set the flexbox justification. */
		justify?: CssClasses;
		/** Provide classes to set the horizontal spacing style. */
		spacing?: CssClasses;
		/** Provide arbitrary classes to the icon region. */
		regionIcon?: CssClasses;
		full?: import('svelte').Snippet;
		half?: import('svelte').Snippet;
		empty?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		onicon = undefined,
		value = 0,
		max = 5,
		interactive = false,
		text = 'text-token',
		fill = 'fill-token',
		justify = 'justify-center',
		spacing = 'space-x-2',
		regionIcon = '',
		full,
		half,
		empty
	}: Props = $props();

	// Event Dispatcher
	type RatingsEvent = {
		icon: { index: number };
	};

	function iconClick(index: number): void {
		/** @event {{ index: number  }} icon - Fires when an icons is clicked */
		onicon?.({
			index: index + 1
		});
	}

	function isFull(value: number, index: number) {
		return Math.floor(value) >= index + 1;
	}

	function isHalf(value: number, index: number) {
		return value === index + 0.5;
	}

	// Classes
	const cBase = 'w-full flex';

	// Reactive
	let classesBase = $derived(`${cBase} ${text} ${fill} ${justify} ${spacing} ${className ?? ''}`);
</script>

<div class="ratings {classesBase}" data-testid="rating-bar">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: max } as _, i}
		{#if interactive}
			<button class="rating-icon {regionIcon}" type="button" onclick={() => iconClick(i)}>
				{#if isFull(value, i)}
					{@render full?.()}
				{:else if isHalf(value, i)}
					{@render half?.()}
				{:else}
					{@render empty?.()}
				{/if}
			</button>
		{:else}
			<span class="rating-icon {regionIcon}">
				{#if isFull(value, i)}
					{@render full?.()}
				{:else if isHalf(value, i)}
					{@render half?.()}
				{:else}
					{@render empty?.()}
				{/if}
			</span>
		{/if}
	{/each}
</div>
