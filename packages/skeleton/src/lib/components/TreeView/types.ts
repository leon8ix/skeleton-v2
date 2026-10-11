import type { Component } from 'svelte';

export interface TreeViewNode {
	/** Nodes Unique ID */
	id: string;
	/** Main content. accepts HTML or svelte component. */
	content: string | Component;
	/** Main content props. only used when the Content is a svelte component. */
	contentProps?: object;
	/** Lead content. accepts HTML or svelte component. */
	lead?: string | Component;
	/** lead props. only used when the Lead is a svelte component. */
	leadProps?: object;
	/** children nodes. */
	children?: TreeViewNode[];
	/** Set the input's value. */
	value?: unknown;
}

/** Public handle exposed by a Svelte 5 TreeViewItem instance. */
export interface TreeViewItemHandle {
	item: { group: unknown; value: unknown; checked: boolean; indeterminate: boolean };
	onParentChange: () => void;
}
