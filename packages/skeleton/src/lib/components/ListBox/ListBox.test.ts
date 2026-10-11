import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import ListBox from '$lib/components/ListBox/ListBox.svelte';

describe('ListBox.svelte', () => {
	it('Renders with minimal props', async () => {
		const { getByTestId } = render(ListBox);
		expect(getByTestId('listbox')).toBeTruthy();
	});

	it('Renders with all props', async () => {
		const { getByTestId } = render(ListBox, {
			props: {
				spacing: 'space-y-1',
				// Props (Item)
				active: '!bg-primary-500', // '!' recommended
				padding: 'px-4 py-3',
				rounded: 'rounded',
				// Props (regions)
				regionLead: 'bg-red-500',
				regionDefault: 'bg-green-500',
				// Props (a11y)
				labelledby: 'testListId1'
			}
		});
		expect(getByTestId('listbox')).toBeTruthy();
	});

	it('Renders listbox, single value', async () => {
		const { getByTestId } = render(ListBox, { props: { multiple: false } });
		const element = getByTestId('listbox');
		expect(element).toBeTruthy();
		expect(element.tagName).eq('DIV');
	});

	it('Renders listbox, multiple values', async () => {
		const { getByTestId } = render(ListBox, { props: { multiple: true } });
		const element = getByTestId('listbox');
		expect(element).toBeTruthy();
		expect(element.tagName).eq('DIV');
	});
});
