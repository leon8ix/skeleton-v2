import type { Plugin } from 'postcss';

/** Preserve Tailwind 3's sibling spacing and specificity in v2 layouts. */
export function skeletonV2Spacing(): Plugin {
	return {
		postcssPlugin: 'skeleton-v2-spacing',
		Rule(rule) {
			const match = /^:where\((.+)\s*>\s*:not\(:last-child\)\)$/.exec(rule.selector);
			if (!match) return;
			let selector = rule.selector;
			let parent = rule.parent;
			while (parent && parent.type !== 'root') {
				if (parent.type === 'rule') selector += parent.selector;
				parent = parent.parent;
			}
			const axis = /space-(x|y)-/.exec(selector)?.[1];
			if (!axis) return;
			rule.selector = `${match[1].trim()} > :not([hidden]) ~ :not([hidden])`;
			rule.walkDecls((declaration) => {
				const properties: Record<string, string> =
					axis === 'y'
						? { 'margin-block-start': 'margin-bottom', 'margin-block-end': 'margin-top' }
						: { 'margin-inline-start': 'margin-right', 'margin-inline-end': 'margin-left' };
				declaration.prop = properties[declaration.prop] ?? declaration.prop;
			});
		}
	};
}
