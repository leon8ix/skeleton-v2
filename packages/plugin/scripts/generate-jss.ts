import { mkdir, readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
async function generate() {
	const components = postcssJs.objectify(postcss.parse(await readFile('./src/styles/components.css', 'utf8')));
	const base = postcssJs.objectify(postcss.parse(await readFile('./src/styles/base.css', 'utf8')));
	await mkdir('./src/tailwind/generated', { recursive: true });
	await writeFile('./src/tailwind/generated/generated-classes.js', 'module.exports = ' + JSON.stringify({ components, base }) + ';\n');
}
generate().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
