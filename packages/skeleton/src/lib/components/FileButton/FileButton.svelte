<script lang="ts">
	// Types
	import type { CssClasses } from '../../index.js';

	//Props

	interface Props {
		class?: string;
		onchange?: ((event: Event) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		/** Bind FileList to the file input. */
		files?: FileList | undefined;
		/** File input reference. */
		fileInput?: HTMLInputElement | undefined;
		/** Required. Set a unique name for the file input. */
		name: string;
		/** Provide classes to set the width. */
		width?: CssClasses;
		/** Provide a button variant or other class styles. */
		button?: CssClasses;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		onchange = undefined,
		onkeydown = undefined,
		onkeyup = undefined,
		onkeypress = undefined,
		files = $bindable(undefined),
		fileInput = $bindable(undefined),
		name,
		width = '',
		button = 'btn variant-filled',
		children,
		...rest
	}: Props = $props();

	function onButtonClick(): void {
		if (fileInput) fileInput.click();
	}

	function prunedRestProps() {
		return rest;
	}

	// Reactive
	let classesBase = $derived(`${className ?? ''}`);
	let classesButton = $derived(`${button} ${width}`);
</script>

<div class="file-button {classesBase}" data-testid="file-button">
	<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
	<div class="w-0 h-0 overflow-hidden">
		<input type="file" bind:this={fileInput} bind:files {name} {...prunedRestProps()} onchange={(event) => onchange?.(event)} />
	</div>
	<!-- Button -->
	<button
		type="button"
		class="file-button-btn {classesButton}"
		disabled={rest.disabled}
		onclick={onButtonClick}
		onkeydown={(event) => onkeydown?.(event)}
		onkeyup={(event) => onkeyup?.(event)}
		onkeypress={(event) => onkeypress?.(event)}
	>
		{#if children}{@render children()}{:else}Select a File{/if}
	</button>
</div>
