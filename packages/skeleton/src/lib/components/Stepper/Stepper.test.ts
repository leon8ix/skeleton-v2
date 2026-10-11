import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import Stepper from '$lib/components/Stepper/Stepper.svelte';

describe('Stepper.svelte', () => {
	it('Renders with minimal props', () => {
		const { getByTestId } = render(Stepper);
		expect(getByTestId('stepper')).toBeTruthy();
	});

	it('Renders with all props', () => {
		const { getByTestId } = render(Stepper, {
			props: {
				active: 'variant-filled-primary',
				// Props (timeline)
				// Props (buttons)
				buttonBack: 'variant-filled',
				buttonNext: 'variant-filled',
				buttonComplete: 'variant-filled'
			}
		});
		expect(getByTestId('stepper')).toBeTruthy();
	});
});
