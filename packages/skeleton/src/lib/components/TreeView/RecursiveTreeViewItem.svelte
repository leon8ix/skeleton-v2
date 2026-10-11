<script lang="ts">
	import TreeViewItem from './TreeViewItem.svelte';
	import RecursiveTreeViewItem from './RecursiveTreeViewItem.svelte';
	import type { TreeViewNode, TreeViewItemHandle } from './types.js';
	import { getContext, onMount, untrack } from 'svelte';

	// this can't be passed using context, since we have to pass it to recursive children.

	// Context API
	let selection: boolean = getContext<boolean>('selection');
	let multiple: boolean = getContext<boolean>('multiple');
	let relational: boolean = getContext<boolean>('relational');

	// Locals
	let group: unknown = $state(multiple ? [] : '');
	let name = $state('');

	// events

	function toggleNode(node: TreeViewNode, open: boolean) {
		// toggle only nodes with children
		if (!node.children?.length) return;
		if (open) {
			// node is not registered as opened
			if (!expandedNodes.includes(node.id)) {
				expandedNodes.push(node.id);
				expandedNodes = expandedNodes;
			}
		} else {
			// node is registered as open
			if (expandedNodes.includes(node.id)) {
				expandedNodes.splice(expandedNodes.indexOf(node.id), 1);
				expandedNodes = expandedNodes;
			}
		}
	}

	function checkNode(node: TreeViewNode, checked: boolean, indeterminate: boolean) {
		if (checked) {
			// node is not registered as checked
			if (!checkedNodes.includes(node.id)) {
				checkedNodes.push(node.id);
				checkedNodes = checkedNodes;
			}

			// node is not indeterminate but registered as indeterminate
			if (!indeterminate && indeterminateNodes.includes(node.id)) {
				indeterminateNodes.splice(indeterminateNodes.indexOf(node.id), 1);
				indeterminateNodes = indeterminateNodes;
			}
		} else {
			// node is registered as checked
			if (checkedNodes.includes(node.id)) {
				checkedNodes.splice(checkedNodes.indexOf(node.id), 1);
				checkedNodes = checkedNodes;
			}

			// node is indeterminate but not registered as indeterminate
			if (indeterminate && !indeterminateNodes.includes(node.id)) {
				indeterminateNodes.push(node.id);
				indeterminateNodes = indeterminateNodes;
				// node is not indeterminate but registered as indeterminate
			} else if (!indeterminate && indeterminateNodes.includes(node.id)) {
				indeterminateNodes.splice(indeterminateNodes.indexOf(node.id), 1);
				indeterminateNodes = indeterminateNodes;
			}
		}
	}

	onMount(async () => {
		if (selection) {
			// random number as name
			name = String(Math.random());

			// remove relational links
			if (!relational) treeItems = [];
		}
	});

	interface Props {
		onclick?: ((event: { id: string }) => void) | undefined;
		ontoggle?: ((event: { id: string }) => void) | undefined;
		/** Provide data-driven nodes. */
		nodes?: TreeViewNode[];
		/** provides id's of expanded nodes */
		expandedNodes?: string[];
		/** provides id's of disabled nodes */
		disabledNodes?: string[];
		/** provides id's of checked nodes */
		checkedNodes?: string[];
		/** provides id's of indeterminate nodes */
		indeterminateNodes?: string[];
		// important to pass children up to items (recursively)
		treeItems?: TreeViewItemHandle[];
	}

	let {
		onclick = undefined,
		ontoggle = undefined,
		nodes = [],
		expandedNodes = $bindable([]),
		disabledNodes = $bindable([]),
		checkedNodes = $bindable([]),
		indeterminateNodes = $bindable([]),
		treeItems = $bindable([])
	}: Props = $props();
	untrack(() => {
		if (selection) {
			if (multiple) {
				nodes.forEach((node) => {
					if (!Array.isArray(group)) return;
					if (checkedNodes.includes(node.id) && !group.includes(node.id)) {
						group.push(node.id);
					}
				});
				group = group;
			} else {
				nodes.forEach((node) => {
					if (checkedNodes.includes(node.id) && group !== node.id) {
						group = node.id;
					}
				});
			}
		}
	});
	let children: TreeViewItemHandle[][] = $state(untrack(() => nodes.map(() => [])));
</script>

{#if nodes && nodes.length > 0}
	{#each nodes as node, i}
		<TreeViewItem
			bind:this={treeItems[i]}
			bind:children={children[i]}
			bind:group
			bind:name
			bind:value={node.id}
			hideLead={!node.lead}
			hideChildren={!node.children || node.children.length === 0}
			open={expandedNodes.includes(node.id)}
			disabled={disabledNodes.includes(node.id)}
			checked={checkedNodes.includes(node.id)}
			indeterminate={indeterminateNodes.includes(node.id)}
			ontoggle={(e) => {
				toggleNode(node, e.open);
				ontoggle?.({ id: node.id });
			}}
			ongroupChange={(e) => checkNode(node, e.checked, e.indeterminate)}
			onclick={() =>
				onclick?.({
					id: node.id
				})}
		>
			{#snippet content()}
				{#if typeof node.content === 'string'}
					{@html node.content}
				{:else}
					<node.content {...node.contentProps} />
				{/if}
			{/snippet}
			{#snippet lead()}
				{#if typeof node.lead === 'string'}
					{@html node.lead}
				{:else if node.lead}
					<node.lead {...node.leadProps} />
				{/if}
			{/snippet}
			{#snippet childContent()}
				<RecursiveTreeViewItem
					nodes={node.children}
					bind:expandedNodes
					bind:disabledNodes
					bind:checkedNodes
					bind:indeterminateNodes
					bind:treeItems={children[i]}
					onclick={(e) =>
						onclick?.({
							id: e.id
						})}
					ontoggle={(e) =>
						ontoggle?.({
							id: e.id
						})}
				/>
			{/snippet}
		</TreeViewItem>
	{/each}
{/if}
