import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compile } from 'tailwindcss';
import postcss, { type Rule } from 'postcss';
import postcssJs from 'postcss-js';
import { skeleton, getThemeProperties, skeletonV2Spacing } from './index.js';
import type { ConfigOptions } from './types.js';

async function build(options: ConfigOptions, candidates: string[]) {
	const compiler = await compile(
		'@layer base, utilities; @theme { --spacing: .25rem; } @layer utilities { @tailwind utilities; } @config "test";',
		{
			loadModule: async () => ({ path: 'test', base: process.cwd(), module: { darkMode: 'class', plugins: [skeleton(options)] } })
		}
	);
	return compiler.build(candidates);
}

describe('Skeleton v2 style compatibility', () => {
	it.each([
		['btn', undefined],
		['btn-icon', undefined],
		['sk-btn', 'sk-'],
		['sk-btn-icon', 'sk-']
	] as const)('keeps %s pressed brightness after hover brightness', async (candidate, prefix) => {
		const css = await build({ prefix }, [candidate]);
		const rules = new Map<string, Rule>();
		postcss.parse(css).walkRules((rule) => {
			const selector = rule.parent?.type === 'rule' ? rule.selector.replaceAll('&', rule.parent.selector) : rule.selector;
			rules.set(selector, rule);
		});
		const hover = rules.get(`.${candidate}:hover`)!;
		const active = rules.get(`.${candidate}:active`)!;
		expect(hover.toString()).toContain('brightness(1.15)');
		expect(active.toString()).toContain('brightness(0.9)');
		expect(hover.source!.start!.offset).toBeLessThan(active.source!.start!.offset);
	});
	it.each(['list-nav a', 'list-nav button', 'list-option'])('keeps %s focus backgrounds after hover backgrounds', async (selector) => {
		const css = await build({}, [selector.split(' ')[0], 'dark']);
		const rules = new Map<string, Rule>();
		postcss.parse(css).walkRules((rule) => {
			const resolved = rule.parent?.type === 'rule' ? rule.selector.replaceAll('&', rule.parent.selector) : rule.selector;
			for (const part of resolved.split(',')) rules.set(part.trim(), rule);
		});
		const hover = rules.get(`.${selector}:hover`)!;
		const focus = rules.get(`.${selector}:focus`)!;
		expect(focus.toString()).toContain('background-color: rgb(var(--color-primary-400) / 0.2)');
		expect(hover.source!.start!.offset).toBeLessThan(focus.source!.start!.offset);
	});
	it.each(['input', 'textarea', 'select', 'input-group'])('keeps %s focus borders after dark-mode defaults', async (candidate) => {
		const css = await build({}, ['dark', candidate]);
		const rules = new Map<string, Rule>();
		postcss.parse(css).walkRules((rule) => {
			const selector = rule.parent?.type === 'rule' ? rule.selector.replaceAll('&', rule.parent.selector) : rule.selector;
			for (const part of selector.split(',')) rules.set(part.trim(), rule);
		});
		const dark = rules.get(`.dark .${candidate}`)!;
		const focus = rules.get(`.${candidate}:focus-within`)!;
		expect(focus.toString()).toContain('border-color: rgb(var(--color-primary-500) / var(--tw-border-opacity))');
		expect(dark.source!.start!.offset).toBeLessThan(focus.source!.start!.offset);
	});
	it('lets custom padding override small button defaults regardless of Tailwind property sorting', async () => {
		const css = await build({}, ['btn', 'btn-sm', 'px-2.5', 'py-[3px]']);
		const rules = new Map<string, Rule>();
		postcss.parse(css).walkRules((rule) => {
			rules.set(rule.selector, rule);
		});
		const smallButton = rules.get('.btn-sm')!;
		expect(smallButton.toString()).toContain('padding: 0.375rem 0.75rem 0.375rem 0.75rem');
		const horizontalPadding = rules.get('.px-2\\.5')!;
		const verticalPadding = rules.get('.py-\\[3px\\]')!;
		expect(smallButton.parent).toBe(horizontalPadding.parent);
		expect(smallButton.parent).toBe(verticalPadding.parent);
		expect(smallButton.source!.start!.offset).toBeLessThan(horizontalPadding.source!.start!.offset);
		expect(smallButton.source!.start!.offset).toBeLessThan(verticalPadding.source!.start!.offset);
		expect(horizontalPadding.toString()).toContain('padding-inline: calc(var(--spacing) * 2.5)');
		expect(verticalPadding.toString()).toContain('padding-block: 3px');
	});
	it('preserves navigation selector specificity against padding and corner utilities', async () => {
		const css = await build({}, ['list-nav', 'px-2', 'py-1', 'rounded-lg']);
		const rules = new Map<string, Rule>();
		postcss.parse(css).walkRules((rule) => {
			rules.set(rule.selector, rule);
		});
		const navigation = rules.get('.list-nav a')!;
		expect(navigation.toString()).toContain('padding-left: 1rem');
		expect(navigation.toString()).toContain('padding-top: 0.5rem');
		expect(navigation.toString()).toContain('border-radius: var(--theme-rounded-base)');
		for (const selector of ['.px-2', '.py-1', '.rounded-lg']) {
			expect(navigation.parent).toBe(rules.get(selector)!.parent);
		}
	});
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
