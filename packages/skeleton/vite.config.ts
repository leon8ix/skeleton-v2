import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
	test: { globals: true, setupFiles: ['./src/test-setup.ts'], environment: 'jsdom', include: ['src/**/*.test.ts'] }
});
