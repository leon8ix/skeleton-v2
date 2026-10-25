import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { ToastSettings } from './types.js';
import ToastTest from './ToastTest.svelte';

// Toast Payload
const toastMessage: ToastSettings = {
	message: 'Your Message Here',
	autohide: true,
	timeout: 5000,
	action: {
		label: 'Greeting',
		response: () => alert('Hello, Skeleton')
	}
};

describe('Toast.svelte', () => {
	const snackbarWrapperTestId = 'snackbar-wrapper';

	// see: https://testing-library.com/docs/svelte-testing-library/faq/#why-arent-transition-events-running
	beforeEach(() => {
		vi.useFakeTimers();
		const rafMock = (fn: (_: Date) => void) => setTimeout(() => fn(new Date()), 16);
		vi.stubGlobal('requestAnimationFrame', rafMock);
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('does not show the toast wrapper if the toast queue is empty', () => {
		expect(() => screen.getByTestId(snackbarWrapperTestId)).toThrow();
	});

	it('keeps the wrapper visible when a new toast is queued as another auto-hides', async () => {
		const { getByTestId } = render(ToastTest, {
			props: {
				max: 2,
				toastSettings: [
					// note how toast B is scheduled to trigger at the same tick as toast A
					{ message: 'A', timeout: 10 },
					{ message: 'B', triggerDelay: 10, timeout: 10 }
				]
			}
		});

		await vi.advanceTimersByTimeAsync(10);
		await tick();
		expect(getByTestId(snackbarWrapperTestId)).toBeTruthy();
		expect(screen.getByText('B')).toBeTruthy();

		await vi.advanceTimersByTimeAsync(6);
		await tick();
		expect(getByTestId(snackbarWrapperTestId)).toBeTruthy();

		await vi.advanceTimersByTimeAsync(64);
		await tick();
		expect(screen.queryByTestId(snackbarWrapperTestId)).toBeNull();
	});

	it('Renders modal alert', async () => {
		const { getByTestId } = render(ToastTest, { props: { toastSettings: [toastMessage] } });
		expect(getByTestId('toast')).toBeTruthy();
	});

	it('Renders only the configured max toasts at a time', async () => {
		const { getAllByTestId } = render(ToastTest, { props: { max: 1, toastSettings: [{ message: '1' }, { message: '2' }] } });
		expect(getAllByTestId('toast').length).toBe(1);
	});
});
