<script lang="ts">
	import { fade } from 'svelte/transition';

	// Types
	import type { CssClasses } from '../../index.js';
	// Stores
	import { tocStore, tocActiveId } from './stores.js';

	// Props (regions)

	interface Props {
		class?: string;
		/** Provide classes to set the inactive anchor styles. */
		inactive?: CssClasses;
		/** Provide classes to set the active anchor styles. */
		active?: CssClasses;
		/** Set the active permalink ID on load. */
		activeId?: string;
		/** Set indentation per each queried element. */
		indentStyles?: Record<string, string>;
		/** Provide arbitrary classes to the lead regions, used for titles. */
		regionLead?: CssClasses;
		/** Provide arbitrary classes to style the list element. */
		regionList?: CssClasses;
		/** Provide arbitrary classes to style the list item elements. */
		regionListItem?: CssClasses;
		/** Provide arbitrary classes to style the anchor elements. */
		regionAnchor?: CssClasses;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		inactive = 'opacity-60 hover:opacity-100',
		active = 'text-primary-500',
		activeId = '',
		indentStyles = {
			h2: '',
			h3: 'ml-4',
			h4: 'ml-8',
			h5: 'ml-12',
			h6: 'ml-16'
		},
		regionLead = 'font-bold',
		regionList = '',
		regionListItem = '',
		regionAnchor = '',
		children
	}: Props = $props();

	// Styles
	const cBase = 'space-y-4';
	const cList = 'space-y-2';
	const cListItem = 'block';
	const cAnchor = '';

	// State
	let reactiveActiveId = $derived($tocActiveId ? $tocActiveId : activeId.replace('#', ''));
	// Reactive
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesList = $derived(`${cList} ${regionList}`);
	let classesListItem = $derived(`${cListItem} ${regionListItem}`);
	let classesAnchor = $derived(`${cAnchor} ${regionAnchor}`);
</script>

{#if $tocStore.length}
	<nav class="toc {classesBase}" data-testid="toc" transition:fade|local={{ duration: 100 }}>
		<!-- Slot: Default (title) -->
		<div class={regionLead}>
			{#if children}{@render children()}{:else}Table of Contents{/if}
		</div>
		<!-- List -->
		<ul class="toc-list {classesList}">
			{#each $tocStore as tocHeading}
				<li class="toc-list-item {classesListItem} {indentStyles[tocHeading.element]}">
					<a
						href="#{tocHeading.id}"
						class="toc-anchor {classesAnchor} {tocHeading.id === reactiveActiveId ? active : inactive}"
						onclick={() => {
							reactiveActiveId = tocHeading.id;
						}}
					>
						{tocHeading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
