import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import InteractionsTest from './InteractionsTest.svelte';
import { Autocomplete, ProgressRadial } from './index.js';
import ModalTest from './utilities/Modal/ModalTest.svelte';

describe('Svelte 5 interaction compatibility', () => {
	it('renders snippets and preserves accordion autocollapse', async () => {
		const view = render(InteractionsTest, { kind: 'accordion' });
		await fireEvent.click(view.getByRole('button', { name: 'First' }));
		expect(view.getByText('First content')).toBeTruthy();
		expect(view.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe('true');
		await fireEvent.click(view.getByRole('button', { name: 'Second' }));
		expect(view.queryByText('First content')).toBeNull();
		expect(view.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe('false');
		expect(view.getByRole('button', { name: 'Second' }).getAttribute('aria-expanded')).toBe('true');
	});
	it('switches tab bindings and snippets with the keyboard', async () => {
		const view = render(InteractionsTest, { kind: 'tabs' });
		await fireEvent.keyDown(view.getByRole('tab', { name: 'First' }), { code: 'ArrowRight' });
		expect(view.getByText('Panel 1')).toBeTruthy();
		expect(view.getByRole('tab', { name: 'Second' }).getAttribute('aria-selected')).toBe('true');
	});
	it('toggles a bound value using the keyboard', async () => {
		const view = render(InteractionsTest, { kind: 'toggle' });
		await fireEvent.keyDown(view.getByRole('switch'), { code: 'Space' });
		expect(view.getByRole('status').textContent).toBe('true');
		expect(view.getByRole('switch').getAttribute('aria-checked')).toBe('true');
	});
	it('adds, removes, and externally replaces chips without reactive loops', async () => {
		const view = render(InteractionsTest, { kind: 'chips' });
		const input = view.getByRole('textbox');
		await fireEvent.input(input, { target: { value: 'alpha' } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(view.getByRole('status').textContent).toBe('["alpha"]');
		await fireEvent.click(view.getByRole('button', { name: 'Replace' }));
		expect(view.queryByText('alpha')).toBeNull();
		expect(view.getByRole('button', { name: /external/ })).toBeTruthy();
		await fireEvent.click(view.getByRole('button', { name: /external/ }));
		expect(view.getByRole('status').textContent).toBe('[]');
	});
	it('updates checkbox groups across list items', async () => {
		const view = render(InteractionsTest, { kind: 'list' });
		const inputs = view.container.querySelectorAll('input');
		await fireEvent.click(inputs[0]);
		await fireEvent.click(inputs[1]);
		expect(view.getByRole('status').textContent).toBe('["a","b"]');
		await fireEvent.click(inputs[0]);
		expect(view.getByRole('status').textContent).toBe('["b"]');
	});
	it('propagates relational tree selection in both directions', async () => {
		const view = render(InteractionsTest, { kind: 'tree' });
		const inputs = view.container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
		expect(inputs.length).toBe(3);
		await fireEvent.click(inputs[0]);
		await waitFor(() => expect(Array.from(inputs, (i) => i.checked)).toEqual([true, true, true]));
		await fireEvent.click(inputs[1]);
		await waitFor(() => expect(inputs[0].indeterminate).toBe(true));
		expect(inputs[0].checked).toBe(false);
		expect(inputs[2].checked).toBe(true);
		await fireEvent.click(inputs[1]);
		expect(Array.from(inputs, (i) => i.checked)).toEqual([true, true, true]);
		await fireEvent.click(inputs[0]);
		expect(Array.from(inputs, (i) => i.checked)).toEqual([false, false, false]);
		expect(view.getByRole('status').textContent).toBe('{"values":[],"indeterminate":[]}');
	});
	it('reacts to changed autocomplete restrictions and passes the selected option directly', async () => {
		const options = [
			{ label: 'Alpha', value: 'a' },
			{ label: 'Beta', value: 'b' }
		];
		const onselection = vi.fn();
		const view = render(Autocomplete, { options, onselection, denylist: ['a'] });
		expect(view.queryByText('Alpha')).toBeNull();
		await view.rerender({ denylist: ['b'] });
		expect(view.queryByText('Beta')).toBeNull();
		await fireEvent.click(view.getByText('Alpha'));
		expect(onselection).toHaveBeenCalledWith(options[0]);
	});
	it('submits the edited modal prompt and closes it', async () => {
		const response = vi.fn();
		const view = render(ModalTest, { modalSetting: { type: 'prompt', title: 'Name', value: 'before', response } });
		await fireEvent.input(view.getByRole('textbox'), { target: { value: 'after' } });
		await fireEvent.click(view.getByRole('button', { name: 'Submit' }));
		expect(response).toHaveBeenCalledWith('after');
		expect(view.queryByTestId('modal')).toBeNull();
	});
	it('recalculates radial geometry when stroke and progress change', async () => {
		const view = render(ProgressRadial, { value: 25, stroke: 10 });
		const circle = view.container.querySelectorAll('circle')[1];
		const initial = circle.getAttribute('style');
		await view.rerender({ value: 75, stroke: 20 });
		expect(circle.getAttribute('r')).toBe('246');
		expect(circle.getAttribute('style')).not.toBe(initial);
	});
});
