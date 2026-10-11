<script lang="ts">
	import { Accordion, AccordionItem, InputChip, ListBox, ListBoxItem, SlideToggle, Tab, TabGroup, RecursiveTreeView } from './index.js';
	let { kind }: { kind: string } = $props();
	let first = $state(false);
	let second = $state(false);
	let selected = $state(0);
	let checked = $state(false);
	let values = $state<string[]>([]);
	let indeterminate = $state<string[]>([]);
	const nodes = [
		{
			id: 'parent',
			content: 'Parent',
			children: [
				{ id: 'a', content: 'Alpha' },
				{ id: 'b', content: 'Beta' }
			]
		}
	];
</script>

{#if kind === 'accordion'}
	<Accordion autocollapse transitions={false}>
		<AccordionItem bind:open={first}>
			{#snippet summary()}First{/snippet}
			{#snippet content()}First content{/snippet}
		</AccordionItem>
		<AccordionItem bind:open={second}>
			{#snippet summary()}Second{/snippet}
			{#snippet content()}Second content{/snippet}
		</AccordionItem>
	</Accordion>
	<output>{JSON.stringify([first, second])}</output>
{:else if kind === 'tabs'}
	<TabGroup>
		<Tab bind:group={selected} name="tabs" value={0}>First</Tab>
		<Tab bind:group={selected} name="tabs" value={1}>Second</Tab>
		{#snippet panelContent()}Panel {selected}{/snippet}
	</TabGroup>
{:else if kind === 'toggle'}
	<SlideToggle name="enabled" label="Enabled" bind:checked />
	<output>{String(checked)}</output>
{:else if kind === 'chips'}
	<InputChip name="tags" bind:value={values} transitions={false} />
	<button onclick={() => (values = ['external'])}>Replace</button>
	<output>{JSON.stringify(values)}</output>
{:else if kind === 'list'}
	<ListBox multiple>
		<ListBoxItem bind:group={values} name="items" value="a">Alpha</ListBoxItem>
		<ListBoxItem bind:group={values} name="items" value="b">Beta</ListBoxItem>
	</ListBox>
	<output>{JSON.stringify(values)}</output>
{:else if kind === 'tree'}
	<RecursiveTreeView
		{nodes}
		selection
		multiple
		relational
		expandedNodes={['parent']}
		bind:checkedNodes={values}
		bind:indeterminateNodes={indeterminate}
	/>
	<output>{JSON.stringify({ values, indeterminate })}</output>
{/if}
