<script lang="ts">
	// Types
	import type { CssClasses } from '../../index.js';

	// Props A11y

	interface Props {
		class?: string;
		/** Specifies the amount completed. Indeterminate when `undefined`. */
		value?: number | undefined;
		/** Minimum amount the bar represents. */
		min?: number;
		/** Maximum amount the bar represents. */
		max?: number;
		/** Provide classes to set track height. */
		height?: CssClasses;
		/** Provide classes to set rounded styles. */
		rounded?: CssClasses;
		/** Provide classes to set the meter transition styles. */
		transition?: CssClasses;
		/** Provide classes to replace the default animation styles. */
		animIndeterminate?: CssClasses;
		/** Sets the base classes of the meter element. */
		meter?: CssClasses;
		/** Sets the base classes of the track element. */
		track?: CssClasses;
		/** Provide the ARIA labelledby value. */
		labelledby?: string;
	}

	let {
		class: className = '',
		value = undefined,
		min = 0,
		max = 100,
		height = 'h-2',
		rounded = 'rounded-token',
		transition = 'transition-[width]',
		animIndeterminate = 'anim-indeterminate',
		meter = 'bg-surface-900-50-token',
		track = 'bg-surface-200-700-token',
		labelledby = ''
	}: Props = $props();

	// Base Classes
	const cTrack = 'w-full overflow-hidden';
	const cMeter = 'h-full';

	// Fill Percent
	let fillPercent = $derived(value ? (100 * (value - min)) / (max - min) : 0);

	// Indeterminate State
	let indeterminate = $derived(value === undefined || value < 0);
	let classesIndeterminate = $derived(indeterminate ? animIndeterminate : '');
	// Reactive Classes
	let classesTrack = $derived(`${cTrack} ${track} ${height} ${rounded} ${className ?? ''}`);
	let classesMeter = $derived(`${cMeter} ${meter} ${rounded} ${classesIndeterminate} ${transition}`);
</script>

<!-- Track -->
<div
	class="progress-bar {classesTrack}"
	data-testid="progress-bar"
	role="progressbar"
	aria-labelledby={labelledby}
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max - min}
>
	<!-- Meter -->
	<div class="progress-bar-meter {classesMeter}" style:width="{indeterminate ? 100 : fillPercent}%"></div>
</div>

<style lang="postcss">
	.anim-indeterminate {
		transform-origin: 0% 50%;
		animation: anim-indeterminate 2s infinite linear;
	}
	/* prettier-ignore */
	@keyframes anim-indeterminate {
		0% { transform: translateX(0) scaleX(0); }
		40% { transform: translateX(0) scaleX(0.4); }
		100% { transform: translateX(100%) scaleX(0.5); }
	}
</style>
