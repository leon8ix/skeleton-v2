import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import Paginator from '$lib/components/Paginator/Paginator.svelte';

describe('Paginator.svelte', () => {
	it('Renders with minimal props', async () => {
		const { getByTestId } = render(Paginator);
		expect(getByTestId('paginator')).toBeTruthy();
	});

	it('Renders with all props', async () => {
		const { getByTestId } = render(Paginator, {
			props: {
				settings: { page: 1, limit: 50, size: 100, amounts: [1, 5, 10, 50, 100] },
				// ---
				justify: 'justify-between',
				select: 'bg-primary-500',
				// ---
				controlVariant: 'variant-filled-primary'
			}
		});
		expect(getByTestId('paginator')).toBeTruthy();
	});
});
