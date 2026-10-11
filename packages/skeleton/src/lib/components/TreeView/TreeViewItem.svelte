<!-- To access props and events using reference -->

<script lang="ts">
	// Slots:
	/** @slot {{}} lead - Allows for an optional leading element, such as an icon. @slot {{}} children - Provide TreeView item children. */
	import { getContext, untrack } from 'svelte';
	import type { TreeViewItemHandle } from './types.js';

	// Types
	import type { CssClasses, SvelteEvent } from '../../index.js';

	// ---

	// ---

	// ---

	// Props (work-around)

	interface Props {
		class?: string;
		ongroupChange?: ((event: { checked: boolean; indeterminate: boolean }) => void) | undefined;
		onchildChange?: (() => void) | undefined;
		ontoggle?: ((event: { open: boolean }) => void) | undefined;
		onchange?: ((event: Event) => void) | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onkeydown?: ((event: KeyboardEvent) => void) | undefined;
		onkeyup?: ((event: KeyboardEvent) => void) | undefined;
		/** Set the radio group binding value. */
		group?: unknown;
		/** Set a unique name value for the input. */
		name?: string | undefined;
		/** Set the input's value. */
		value?: unknown;
		/** Set the input's check state */
		checked?: boolean;
		/** Provide children references to support relational checking. */
		children?: TreeViewItemHandle[];
		/** Provide classes to set the horizontal spacing. */
		spacing?: CssClasses;
		/** Set open by default on load. */
		open?: boolean;
		/** Enable tree-view selection */
		selection?: boolean;
		/** Enable selection of multiple items. */
		multiple?: boolean;
		/** Set the tree item disabled state */
		disabled?: boolean;
		/** Set the check state to indeterminate(-). */
		indeterminate?: boolean;
		/** Provide classes to set the tree item padding styles. */
		padding?: CssClasses;
		/** Provide classes to set the tree children indentation */
		indent?: CssClasses;
		/** Provide classes to set the tree item hover styles. */
		hover?: CssClasses;
		/** Provide classes to set the tree item rounded styles. */
		rounded?: CssClasses;
		/** Set the rotation of the item caret in the open state. */
		caretOpen?: CssClasses;
		/** Set the rotation of the item caret in the closed state. */
		caretClosed?: CssClasses;
		/* Set the hyphen symbol opacity for non-expandable rows. */
		hyphenOpacity?: CssClasses;
		/** Provide arbitrary classes to the tree item summary region. */
		regionSummary?: CssClasses;
		/** Provide arbitrary classes to the symbol icon region. */
		regionSymbol?: CssClasses;
		/** Provide arbitrary classes to the children region. */
		regionChildren?: CssClasses;
		/** Don't use this prop, workaround until svelte implements conditional slots */
		hideLead?: boolean;
		/** Don't use this prop, workaround until svelte implements conditional slots */
		hideChildren?: boolean;
		childContent?: import('svelte').Snippet;
		lead?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		ongroupChange = undefined,
		onchildChange = undefined,
		ontoggle = undefined,
		onchange = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onkeyup = undefined,
		group = $bindable(undefined),
		name = $bindable(undefined),
		value = $bindable(undefined),
		checked = $bindable(false),
		children = $bindable([]),
		spacing = 'space-x-4',
		open = $bindable(getContext('open')),
		selection = getContext<NonNullable<Props['selection']>>('selection'),
		multiple = getContext<NonNullable<Props['multiple']>>('multiple'),
		disabled = getContext<NonNullable<Props['disabled']>>('disabled'),
		indeterminate = $bindable(false),
		padding = getContext<NonNullable<Props['padding']>>('padding'),
		indent = getContext<NonNullable<Props['indent']>>('indent'),
		hover = getContext<NonNullable<Props['hover']>>('hover'),
		rounded = getContext<NonNullable<Props['rounded']>>('rounded'),
		caretOpen = getContext<NonNullable<Props['caretOpen']>>('caretOpen'),
		caretClosed = getContext<NonNullable<Props['caretClosed']>>('caretClosed'),
		hyphenOpacity = getContext<NonNullable<Props['hyphenOpacity']>>('hyphenOpacity'),
		regionSummary = getContext<NonNullable<Props['regionSummary']>>('regionSummary'),
		regionSymbol = getContext<NonNullable<Props['regionSymbol']>>('regionSymbol'),
		regionChildren = getContext<NonNullable<Props['regionChildren']>>('regionChildren'),
		hideLead = false,
		hideChildren = false,
		childContent,
		lead,
		content
	}: Props = $props();

	export const item: TreeViewItemHandle['item'] = {
		get group() {
			return group;
		},
		set group(next) {
			group = next;
		},
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		},
		get checked() {
			return checked;
		},
		set checked(next) {
			checked = next;
		},
		get indeterminate() {
			return indeterminate;
		},
		set indeterminate(next) {
			indeterminate = next;
		}
	};
	// Locals
	let treeItem = $state<HTMLDetailsElement>();
	let childrenDiv = $state<HTMLDivElement>();

	// Functionality
	function onSummaryClick(event: MouseEvent) {
		// prevent any action when disabled
		if (disabled) event.preventDefault();
	}
	function updateCheckbox(group: unknown, indeterminate: boolean) {
		if (!Array.isArray(group)) return;
		checked = group.indexOf(value) >= 0;
		/** @event {{checked: boolean, indeterminate: boolean}} groupChange - Fires when the group changes */
		ongroupChange?.({ checked: checked, indeterminate: indeterminate });
		onchildChange?.();
	}
	function updateGroup(checked: boolean, indeterminate: boolean) {
		if (!Array.isArray(group)) return;
		const index = group.indexOf(value);
		if (checked) {
			if (index < 0) {
				group.push(value);
				group = group;
			}
		} else {
			if (index >= 0) {
				group.splice(index, 1);
				group = group;
			}
		}
		if (!indeterminate) {
			onParentChange();
		}
	}

	function updateRadio(group: unknown) {
		checked = group === value;
		/** @event {{checked: boolean, indeterminate: boolean}} groupChange - Fires when the group changes */
		ongroupChange?.({ checked: checked, indeterminate: false });
		if (group) onchildChange?.();
	}
	function updateRadioGroup(checked: boolean) {
		if (checked && group !== value) group = value;
		else if (!checked && group === value) group = '';
	}

	// called when a child's value is changed
	function onChildValueChange() {
		if (multiple) {
			// all groups must be arrays in multiple mode
			if (!Array.isArray(group)) return;
			const childrenValues = children.map((c) => c.item.value);
			const childrenGroup = children[0].item.group;
			const index = group.indexOf(value);
			// at least one child is indeterminate => indeterminate item
			if (children.some((c) => c.item.indeterminate)) {
				indeterminate = true;
				if (index >= 0) {
					group.splice(index, 1);
					group = group;
				}
			}
			// all children are checked => check item
			else if (childrenValues.every((c) => Array.isArray(childrenGroup) && childrenGroup.includes(c))) {
				indeterminate = false;
				if (index < 0) {
					group.push(value);
					group = group;
				}
			}
			// not all children are checked => indeterminate item
			else if (childrenValues.some((c) => Array.isArray(childrenGroup) && childrenGroup.includes(c))) {
				indeterminate = true;
				if (index >= 0) {
					group.splice(index, 1);
					group = group;
				}
			}
			// all children are unchecked => uncheck item
			else {
				indeterminate = false;
				if (index >= 0) {
					group.splice(index, 1);
					group = group;
				}
			}
		}
		// single selection mode
		else {
			// one of the children is checked => check item
			if (group !== value && children.some((c) => c.item.checked)) {
				group = value;
				// none of the children are checked => uncheck item
			} else if (group === value && !children.some((c) => c.item.checked)) {
				group = '';
			}
		}
		// important to notify parent of item
		/** @event childChange - Fires when the group of the child changes */
		onchildChange?.();
	}

	// used to update children of item when checked / unchecked in multiple mode
	export function onParentChange() {
		if (!multiple || !children || children.length === 0) return;

		// group must by array in multiple mode
		if (!Array.isArray(group)) return;
		const index = group.indexOf(value);

		const checkChild = (child: TreeViewItemHandle) => {
			if (!child || !Array.isArray(child.item.group)) return;
			child.item.indeterminate = false;
			if (child.item.group.indexOf(child.item.value) < 0) {
				child.item.group.push(child.item.value);
				child.item.group = child.item.group;
			}
		};
		const uncheckChild = (child: TreeViewItemHandle) => {
			if (!child || !Array.isArray(child.item.group)) return;
			child.item.indeterminate = false;
			const childIndex = child.item.group.indexOf(child.item.value);
			if (childIndex >= 0) {
				child.item.group.splice(childIndex, 1);
				child.item.group = child.item.group;
			}
		};

		children.forEach((child) => {
			if (!child) return;
			// if parent is checked, check all children, else uncheck all children
			index >= 0 ? checkChild(child) : uncheckChild(child);
			// notify children to update values
			child.onParentChange();
		});
	}

	// A11y Key Down Handler
	function onKeyDown(event: SvelteEvent<KeyboardEvent, HTMLElement>): void {
		function getRootTree(): HTMLDivElement | undefined {
			let currentElement: HTMLElement | null = treeItem ?? null;
			while (currentElement !== null) {
				if (currentElement.classList.contains('tree')) return currentElement as HTMLDivElement;
				currentElement = currentElement.parentElement;
			}
			return undefined;
		}

		let rootTree: HTMLDivElement | undefined = undefined;
		let lastVisibleElement: HTMLElement | undefined | null = null;

		switch (event.code) {
			case 'ArrowRight':
				if (!open) open = true;
				else if (childContent && !hideChildren) {
					// focus on first child
					const child = childrenDiv?.querySelector<HTMLElement>('details>summary');
					if (child) child.focus();
				}
				break;
			case 'ArrowLeft':
				if (open) open = false;
				else {
					// focus on parent
					const parent = treeItem?.parentElement?.parentElement;
					if (parent && parent.tagName === 'DETAILS') parent.querySelector<HTMLElement>('summary')?.focus();
				}
				break;
			case 'Home':
				event.preventDefault();
				rootTree = getRootTree();
				// focus on first node
				if (rootTree) rootTree?.querySelector('summary')?.focus();
				break;
			case 'End':
				event.preventDefault();
				rootTree = getRootTree();
				// focus on last node
				if (rootTree) {
					const detailsElements = rootTree?.querySelectorAll('details');
					if (!detailsElements) return;
					// start from last details
					for (let i = detailsElements.length - 1; i >= 0; i--) {
						const details = detailsElements[i];
						// when details is on root level or the parent of details is open
						if (details.parentElement?.classList?.contains('tree') || details.parentElement?.parentElement?.getAttribute('open') !== null) {
							lastVisibleElement = details;
							break;
							// when details is not on root level but parent is not details
						} else if (details.parentElement?.parentElement?.tagName !== 'details') {
							lastVisibleElement = details.parentElement.parentElement;
							break;
						}
					}

					// focus on last visible node
					if (lastVisibleElement) {
						const summary = lastVisibleElement.querySelector('summary');
						if (summary) summary.focus();
					}
				}
				break;
		}
	}

	// Classes
	const cBase = '';
	// [&::-webkit-details-marker]:hidden -> hide default arrow on webkit browsers
	const cSummary = 'list-none [&::-webkit-details-marker]:hidden flex items-center cursor-pointer';
	const cSymbol = 'fill-current w-3 text-center transition-transform duration-[200ms]';
	const cChildren = '';
	const cDisabled = 'opacity-50 !cursor-not-allowed';

	// Track the source values only; callback code must not become an effect dependency.
	$effect.pre(() => {
		const currentGroup = Array.isArray(group) ? group.slice() : group;
		const currentIndeterminate = indeterminate;
		if (multiple) untrack(() => updateCheckbox(currentGroup, currentIndeterminate));
	});
	$effect.pre(() => {
		const currentChecked = checked;
		const currentIndeterminate = indeterminate;
		if (multiple) untrack(() => updateGroup(currentChecked, currentIndeterminate));
	});
	$effect.pre(() => {
		const currentGroup = group;
		if (!multiple) untrack(() => updateRadio(currentGroup));
	});
	$effect.pre(() => {
		const currentChecked = checked;
		if (!multiple) untrack(() => updateRadioGroup(currentChecked));
	});
	// used to update children of item when checked / unchecked in single mode
	$effect.pre(() => {
		if (!multiple && group !== undefined) {
			if (group !== value) {
				// uncheck all children
				children.forEach((child) => {
					if (child) child.item.group = '';
				});
			}
		}
	});
	// events

	/** @event {{ open: boolean }} toggle - Fires on open or close. */
	$effect.pre(() => {
		const currentOpen = open;
		untrack(() => ontoggle?.({ open: currentOpen }));
	});
	// Observe relational children without the removed component $on API.
	$effect(() => {
		if (!children.length) return;
		for (const child of children) {
			if (!child) continue;
			const childGroup = child.item.group;
			if (Array.isArray(childGroup)) childGroup.slice();
			child.item.checked;
			child.item.indeterminate;
		}
		untrack(onChildValueChange);
	});
	// Reactive State Classes
	let classesCaretState = $derived(open && childContent && !hideChildren ? caretOpen : caretClosed);
	// Reactive Classes
	let classesDisabled = $derived(disabled ? cDisabled : '');
	let classesBase = $derived(`${cBase} ${className ?? ''}`);
	let classesSummary = $derived(`${cSummary} ${classesDisabled} ${spacing} ${rounded} ${padding} ${hover} ${regionSummary}`);
	let classesCaret = $derived(`${classesCaretState}`);
	let classesSymbol = $derived(`${cSymbol} ${classesCaret} ${regionSymbol}`);
	let classesHyphen = $derived(`${hyphenOpacity}`);
	let classesChildren = $derived(`${cChildren} ${indent} ${regionChildren}`);

	export {
		className,
		ongroupChange,
		onchildChange,
		ontoggle,
		onchange,
		onclick,
		onkeydown,
		onkeyup,
		group,
		name,
		value,
		checked,
		children,
		spacing,
		open,
		selection,
		multiple,
		disabled,
		indeterminate,
		padding,
		indent,
		hover,
		rounded,
		caretOpen,
		caretClosed,
		hyphenOpacity,
		regionSummary,
		regionSymbol,
		regionChildren,
		hideLead,
		hideChildren
	};
</script>

<details bind:this={treeItem} bind:open class="tree-item {classesBase}" data-testid="tree-item" aria-disabled={disabled}>
	<summary
		class="tree-item-summary {classesSummary}"
		role="treeitem"
		aria-selected={selection ? checked : undefined}
		aria-expanded={childContent ? open : undefined}
		onclick={(event) => {
			onSummaryClick(event);
			onclick?.(event);
		}}
		onkeydown={(event) => {
			onKeyDown(event);
			onkeydown?.(event);
		}}
		onkeyup={(event) => onkeyup?.(event)}
	>
		<!-- Symbol -->
		<div class="tree-summary-symbol {classesSymbol}">
			{#if childContent && !hideChildren}
				<!-- SVG Caret -->
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
					<path
						d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
					/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-3 {classesHyphen}">
					<path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
				</svg>
			{/if}
		</div>

		<!-- Selection -->
		{#if selection && name && group !== undefined}
			{#if multiple}
				<input
					class="checkbox tree-item-checkbox"
					type="checkbox"
					{name}
					{value}
					bind:checked
					bind:indeterminate
					onchange={(event) => {
						checked = event.currentTarget.checked;
						indeterminate = false;
						updateGroup(checked, indeterminate);
						onchange?.(event);
					}}
				/>
			{:else}
				<input class="radio tree-item-radio" type="radio" bind:group {name} {value} />
			{/if}
		{/if}

		<!-- Slot: Lead -->
		{#if lead && !hideLead}
			<div class="tree-item-lead">
				{@render lead?.()}
			</div>
		{/if}
		<!-- Slot: Content -->
		<div class="tree-item-content">
			{@render content?.()}
		</div>
	</summary>
	<div bind:this={childrenDiv} class="tree-item-children {classesChildren}" role="group">
		{@render childContent?.()}
	</div>
</details>
