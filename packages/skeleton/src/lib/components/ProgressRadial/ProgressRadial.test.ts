import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import ProgressRadial from '$lib/components/ProgressRadial/ProgressRadial.svelte';

describe('ProgressRadial.svelte', () => {
	it('Renders with minimal props', async () => {
		const { getByTestId } = render(ProgressRadial);
		expect(getByTestId('progress-radial')).toBeTruthy();
	});

	it('Renders with all props', () => {
		const { getByTestId } = render(ProgressRadial, {
			props: {
				value: 50,
				stroke: 20,
				track: 'stroke-surface-300 dark:stroke-surface-700',
				meter: 'stroke-black dark:stroke-white',
				fill: 'fill-black dark:fill-white',
				font: 56,
				labelledby: 'testProgressRadial1',
				strokeLinecap: 'round'
			}
		});
		expect(getByTestId('progress-radial')).toBeTruthy();
	});
});
