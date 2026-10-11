import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import TabGroup from '$lib/components/Tab/TabGroup.svelte';

describe('TabGroup.svelte', () => {
	it('Renders with minimal props', async () => {
		const { getByTestId } = render(TabGroup, {});
		expect(getByTestId('tab-group')).toBeTruthy();
	});

	it('Renders with minimal props', async () => {
		const { getByTestId } = render(TabGroup, {
			props: {
				justify: 'justify-start',
				hover: 'hover:bg-primary-500/10',
				labelledby: 'testTabGroupLabel1'
			}
		});
		expect(getByTestId('tab-group')).toBeTruthy();
	});
});
