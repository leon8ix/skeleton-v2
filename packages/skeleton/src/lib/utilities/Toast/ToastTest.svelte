<script lang="ts">
	import { untrack } from 'svelte';
	import { initializeToastStore, getToastStore } from './stores.js';
	import type { ToastSettings } from './types.js';
	import Toast from './Toast.svelte';

	interface TestToastSettings extends ToastSettings {
		triggerDelay?: number;
	}

	interface Props {
		toastSettings?: Array<TestToastSettings>;
		max?: number | undefined;
	}

	let { toastSettings = [], max = undefined }: Props = $props();

	initializeToastStore();
	const toastStore = getToastStore();

	untrack(() =>
		toastSettings.forEach(({ triggerDelay, ...settings }) => {
			if (triggerDelay) {
				setTimeout(() => toastStore.trigger(settings), triggerDelay);
			} else {
				toastStore.trigger(settings);
			}
		})
	);
</script>

<Toast {max} />
