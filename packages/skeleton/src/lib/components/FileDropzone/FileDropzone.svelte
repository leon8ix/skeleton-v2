<script lang="ts">
	// Types
	import type { CssClasses } from '../../index.js';

	// Props (slots)

	interface Props {
		class?: string;
		onchange?: ((event: Event) => void) | undefined;
		ondragenter?: ((event: DragEvent) => void) | undefined;
		ondragover?: ((event: DragEvent) => void) | undefined;
		ondragleave?: ((event: DragEvent) => void) | undefined;
		ondrop?: ((event: DragEvent) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		onkeypress?: ((event: KeyboardEvent) => void) | undefined;
		onfocus?: ((event: FocusEvent) => void) | undefined;
		onfocusin?: ((event: FocusEvent) => void) | undefined;
		onfocusout?: ((event: FocusEvent) => void) | undefined;
		/** Bind FileList to the file input. */
		files?: FileList | undefined;
		/** File input reference. */
		fileInput?: HTMLInputElement | undefined;
		/** Required. Set a unique name for the file input. */
		name: string;
		/** Provide classes to set the border styles. */
		border?: CssClasses;
		/** Provide classes to set the padding styles. */
		padding?: CssClasses;
		/** Provide classes to set the box radius styles. */
		rounded?: CssClasses;
		/** Provide arbitrary styles for the UI region. */
		regionInterface?: CssClasses;
		/** Provide arbitrary styles for the UI text region. */
		regionInterfaceText?: CssClasses;
		/** Provide arbitrary styles for lead slot container. */
		slotLead?: CssClasses;
		/** Provide arbitrary styles for message slot container. */
		slotMessage?: CssClasses;
		/** Provide arbitrary styles for meta text slot container. */
		slotMeta?: CssClasses;
		lead?: import('svelte').Snippet;
		message?: import('svelte').Snippet;
		meta?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = '',
		onchange = undefined,
		ondragenter = undefined,
		ondragover = undefined,
		ondragleave = undefined,
		ondrop = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onkeyup = undefined,
		onkeypress = undefined,
		onfocus = undefined,
		onfocusin = undefined,
		onfocusout = undefined,
		files = $bindable(undefined),
		fileInput = $bindable(undefined),
		name,
		border = 'border-2 border-dashed',
		padding = 'p-4 py-8',
		rounded = 'rounded-container-token',
		regionInterface = '',
		regionInterfaceText = '',
		slotLead = 'mb-4',
		slotMessage = '',
		slotMeta = 'opacity-75',
		lead,
		message,
		meta,
		...rest
	}: Props = $props();

	const cBase = 'textarea relative flex justify-center items-center';
	const cInput = 'w-full absolute top-0 left-0 right-0 bottom-0 z-[1] opacity-0 disabled:!opacity-0 cursor-pointer';
	const cInterface = 'flex justify-center items-center text-center';

	// Reactive
	let classesBase = $derived(`${cBase} ${border} ${padding} ${rounded} ${className ?? ''}`);
	let classesInput = $derived(`${cInput}`);
	let classesInterface = $derived(`${cInterface}`);

	// Pruned RestProps
	function prunedRestProps() {
		return rest;
	}
</script>

<div class="dropzone {classesBase}" class:opacity-50={rest.disabled} data-testid="file-dropzone">
	<!-- Input: File (hidden) -->
	<!-- NOTE: keep `bind:files` here, unlike FileButton -->
	<input
		bind:files
		bind:this={fileInput}
		type="file"
		{name}
		class="dropzone-input {classesInput}"
		{...prunedRestProps()}
		onchange={(event) => onchange?.(event)}
		ondragenter={(event) => ondragenter?.(event)}
		ondragover={(event) => ondragover?.(event)}
		ondragleave={(event) => ondragleave?.(event)}
		ondrop={(event) => ondrop?.(event)}
		onclick={(event) => onclick?.(event)}
		onkeydown={(event) => onkeydown?.(event)}
		onkeyup={(event) => onkeyup?.(event)}
		onkeypress={(event) => onkeypress?.(event)}
		onfocus={(event) => onfocus?.(event)}
		onfocusin={(event) => onfocusin?.(event)}
		onfocusout={(event) => onfocusout?.(event)}
	/>
	<!-- Interface -->
	<div class="dropzone-interface {classesInterface} {regionInterface}">
		<div class="dropzone-interface-text {regionInterfaceText}">
			<!-- Lead -->
			{#if lead}<div class="dropzone-lead {slotLead}">{@render lead?.()}</div>{/if}
			<!-- Message -->
			<div class="dropzone-message {slotMessage}">
				{#if message}{@render message()}{:else}<strong>Upload a file</strong> or drag and drop{/if}
			</div>
			<!-- Meta Text -->
			{#if meta}<small class="dropzone-meta {slotMeta}">{@render meta?.()}</small>{/if}
		</div>
	</div>
</div>
