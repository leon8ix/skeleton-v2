import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compile } from 'tailwindcss';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import { skeleton, getThemeProperties, skeletonV2Spacing } from './index.js';
import type { ConfigOptions } from './types.js';

async function build(options: ConfigOptions, candidates: string[]) {
	const compiler = await compile('@layer base, utilities; @tailwind utilities; @config "test";', {
		loadModule: async () => ({ path: 'test', base: process.cwd(), module: { darkMode: 'class', plugins: [skeleton(options)] } })
	});
	return compiler.build(candidates);
}

describe('Skeleton v2 style compatibility', () => {
	it('preserves sibling spacing, hidden-child handling, and custom margin overrides', async () => {
		const compiler = await compile('@theme { --spacing: .25rem; } @tailwind utilities;');
		const generated = compiler.build(['space-y-12', 'space-x-4', 'space-y-reverse']);
		const { css } = await postcss([skeletonV2Spacing()]).process(generated, { from: undefined });
		expect(css).toContain('.space-y-12 > :not([hidden]) ~ :not([hidden])');
		expect(css).toContain('margin-top: calc(calc(var(--spacing) * 12) * calc(1 - var(--tw-space-y-reverse)))');
		expect(css).toContain('margin-left: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)))');
		expect(css).not.toContain(':last-child');
	});
	// Captured from the official @skeletonlabs/tw-plugin@0.4.1 output,
	// formatted with this repository's Prettier config before hashing declarations.
	it.each([
		['base', 'd7e05fccb3da6b324a487effcf2071d8ad4ed0cac3b68a6b6d880d23529c2580'],
		['components', '14c14b25e94c45ee9077403d4e1e38f70c5a92cb398e138629fe00926cb23241']
	])('preserves every official %s declaration', (name, hash) => {
		const css = readFileSync(new URL(`./styles/${name}.css`, import.meta.url), 'utf8');
		const declarations = postcssJs.objectify(postcss.parse(css));
		expect(createHash('sha256').update(JSON.stringify(declarations)).digest('hex')).toBe(hash);
	});
	it('compiles buttons, theme tokens, dark variants, and responsive v2 typography with Tailwind 4', async () => {
		const css = await build({ themes: { preset: ['skeleton'] } }, [
			'btn',
			'h1',
			'variant-filled-primary',
			'rounded-container-token',
			'dark:bg-primary-400',
			'hover:variant-soft-primary'
		]);
		expect(css).toContain('.btn {');
		expect(css).toContain('padding-top: 9px');
		expect(css).toContain('border-radius: var(--theme-rounded-container)');
		expect(css).toContain("data-theme='skeleton'");
		expect(css).toContain('dark\\:bg-primary-400');
		expect(css).toContain('hover\\:variant-soft-primary');
		expect(css).toContain('@media (min-width: 768px)');
		expect(css).toContain('font-size: 3rem');
	});
	it('retains custom themes, dark overrides, and optional component prefixes', async () => {
		const css = await build(
			{
				base: false,
				prefix: 'sk-',
				themes: {
					custom: [
						{
							name: 'custom',
							properties: { ...getThemeProperties('skeleton'), '--color-primary-500': '1 2 3' },
							properties_dark: { '--color-primary-500': '4 5 6' }
						}
					]
				}
			},
			['sk-btn']
		);
		expect(css).toContain('.sk-btn {');
		expect(css).not.toContain('.btn {');
		expect(css).toContain('--color-primary-500: 1 2 3');
		expect(css).toContain('--color-primary-500: 4 5 6');
		expect(css).not.toContain('scrollbar-color');
	});
});
