import { vi } from 'vitest';
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn((query: string) => ({
		matches: query === '(prefers-reduced-motion: reduce)',
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

Object.defineProperty(Element.prototype, 'getAnimations', { value: () => [] });
