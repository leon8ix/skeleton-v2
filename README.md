# Maintained Skeleton v2

This independent fork preserves Skeleton v2's complete UI library, themes, tokens, and design while using native Svelte 5 and Tailwind CSS 4.

It starts at the official [`@skeletonlabs/skeleton@2.11.0`](https://github.com/skeletonlabs/skeleton/tree/04cf8e035e3d7a10f47e07b9d3d4afad61fbabcc) release, commit `04cf8e035e3d7a10f47e07b9d3d4afad61fbabcc`, including `@skeletonlabs/tw-plugin@0.4.1`. Active work lives on [`modernize-v2`](https://github.com/leon8ix/skeleton-v2/tree/modernize-v2).

## Scope

| Directory           | Maintained package                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `packages/skeleton` | `@leon8ix/skeleton-v2`: all components, actions, stores, utilities, and transitions        |
| `packages/plugin`   | `@leon8ix/skeleton-v2-tailwind`: themes, design tokens, v2 CSS, and Tailwind 4 integration |

The original documentation website, app-creation CLI, and obsolete development/release tooling are preserved in `archive/`. They are historical reference material, excluded from workspaces, installation, builds, formatting, tests, and dependency audits. Archived documentation describes the original Svelte API; apply the migration notes below.

## Development

Use Node.js 24 and npm 12.2.1. Dependencies are locked in the root `package-lock.json`.

```sh
npm ci
npm run build
npm run check
npm test
npm run format:check
npm audit
npm pack --workspaces
```

Run `npm run format` after edits. Build before testing the plugin because its generated CSS module is a build artifact. CI validates the maintained packages without publishing them.

Updated the maintained packages and compatible transitive dependencies to their latest supported releases on 2026-10-25, including Svelte packaging/checking tools, Vite, Vitest, jsdom, PostCSS, and its selector parser. CI uses npm 12.2.1.

TypeScript remains at 6.0.3 because `@sveltejs/package@3.0.1` requires TypeScript 6 and `svelte-check@4.7.7` requires TypeScript 5 or 6. Node types remain at the latest Node 24 release, 24.19.2, to match the supported runtime. Archived packages retain historical dependencies.

Package versions retain the upstream baseline numbers during this feature-branch migration. No npm release has been published. Fontanum installs built archives from its checked-in `vendor/` directory, with integrity recorded in its lockfile. Deployment does not depend on a sibling checkout. Rebuild and replace both archives together when changing this fork.

## Tailwind 4 setup

Keep the v2 theme configuration in `tailwind.config.cjs`:

```js
const { skeleton } = require('@leon8ix/skeleton-v2-tailwind');
module.exports = {
	darkMode: 'class',
	plugins: [skeleton({ themes: { preset: ['skeleton'] } })]
};
```

Use a `.css` entry point; Tailwind's Vite transform does not process `.pcss` entry points.

```css
@layer theme, base, components, utilities;
@import 'tailwindcss/theme' layer(theme);
@import '@leon8ix/skeleton-v2-tailwind/src/styles/preflight.css' layer(base);
@import 'tailwindcss/utilities' layer(utilities);
@config '../tailwind.config.cjs';
@source '../node_modules/@leon8ix/skeleton-v2/dist';
```

Adjust relative paths for the application. Put application-wide resets in a layer before `base` so they do not override layered utilities.

Put general focus styling such as `:focus-visible` outline colors in `@layer base` so form controls retain their own focus indicators. Components and utilities share a layer to preserve v2 selector specificity, including rounded navigation links. Button and navigation interaction rules are registered together to preserve their original state ordering: pressed buttons darken even while hovered, and navigation focus backgrounds take precedence over hover backgrounds. During generation, button-size padding is combined into an equivalent shorthand so custom `px-*` and `py-*` utilities retain their precedence under Tailwind 4's property sorting.

```ts
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { skeletonV2Spacing } from '@leon8ix/skeleton-v2-tailwind';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	css: { postcss: { plugins: [skeletonV2Spacing()] } }
});
```

`skeletonV2Spacing()` restores the original `space-x-*` and `space-y-*` sibling selectors and physical margins after Tailwind compilation. This preserves hidden-child handling, reversed spacing, and precedence against existing margin utilities. Tailwind 4 changed these rules, which otherwise changes v2 layouts.

The plugin retains v2's default colors, shadows, radii, typography, and reset. Base and component declarations are frozen from the official plugin output; tests compare every declaration with the upstream baseline. There is no Tailwind 3 runtime dependency. Tailwind 4's [browser requirements](https://tailwindcss.com/docs/upgrade-guide) apply.

## Svelte 5 API migration

Import from `@leon8ix/skeleton-v2`. Components use runes, callback props, and snippets without a legacy component wrapper.

- Replace component event directives with callbacks: `on:selection={(event) => choose(event.detail)}` becomes `onselection={choose}`. Component callbacks receive the former event detail directly; forwarded DOM callbacks still receive DOM events
- Replace named slots with snippets of the same name; default content becomes `children`
- `TabGroup` uses `panelContent` for its panel snippet, preserving the existing `panel` string prop
- `TreeViewItem` uses `content` for default content and `childContent` for children, preserving the existing `children` array of relational references
- Tree references expose selection state through `ref.item` and `ref.onParentChange()`; component `$on` listeners are replaced with callbacks and reactive relationships
- Bind writable state such as `open`, `checked`, `group`, and input values. Read-only inputs, such as `Autocomplete.input`, are passed as ordinary props
- The clipboard action uses `oncopyComplete` for its DOM completion event

```svelte
<script lang="ts">
	import { Accordion, AccordionItem } from '@leon8ix/skeleton-v2';
	let open = $state(false);
</script>

<Accordion>
	<AccordionItem bind:open>
		{#snippet summary()}Options{/snippet}
		{#snippet content()}The original v2 panel styling{/snippet}
	</AccordionItem>
</Accordion>
```

## Validation and license

Tests cover the upstream component suite, callback payloads, keyboard tabs and switches, accordion collapse, checkbox groups, chip editing, modal prompts, relational tree selection, reactive radial progress, and Tailwind compilation. The original skipped LightSwitch test remains skipped. Fontanum was also checked in the browser at desktop and mobile widths; this is representative coverage, not an exhaustive guarantee for every component combination.

Skeleton's original MIT license and attribution are retained. The frozen Tailwind reset/defaults are covered by the included `LICENSE-TAILWIND` in the styling package.
