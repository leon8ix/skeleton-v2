import { mkdir, readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
async function generate() {
	const componentStyles = postcss.parse(await readFile('./src/styles/components.css', 'utf8'));
	// Equivalent padding shorthand makes button sizes sort before px/py utilities
	// in Tailwind 4 without changing the cascade for other components.
	componentStyles.walkRules((rule) => {
		if (!rule.selector.split(',').every((selector) => /^\.btn-(sm|md|base|lg|xl)$/.test(selector.trim()))) return;
		const padding: Record<string, string> = {};
		rule.walkDecls(/^padding-(top|right|bottom|left)$/, (declaration) => {
			padding[declaration.prop] = declaration.value;
			declaration.remove();
		});
		rule.prepend({ prop: 'padding', value: ['top', 'right', 'bottom', 'left'].map((side) => padding[`padding-${side}`]).join(' ') });
	});
	const components = postcssJs.objectify(componentStyles);
	const base = postcssJs.objectify(postcss.parse(await readFile('./src/styles/base.css', 'utf8')));
	await mkdir('./src/tailwind/generated', { recursive: true });
	await writeFile('./src/tailwind/generated/generated-classes.js', 'module.exports = ' + JSON.stringify({ components, base }) + ';\n');
}
generate().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
