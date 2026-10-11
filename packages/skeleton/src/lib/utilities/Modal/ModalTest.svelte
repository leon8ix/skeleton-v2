<script lang="ts">
	import { untrack } from 'svelte';
	import { initializeModalStore, getModalStore } from './stores.js';
	import Modal from './Modal.svelte';
	import type { ModalSettings } from './types.js';

	interface Props {
		modalSetting: ModalSettings;
	}

	let { modalSetting }: Props = $props();

	initializeModalStore();
	untrack(() => getModalStore().trigger(modalSetting));
</script>

<Modal />
