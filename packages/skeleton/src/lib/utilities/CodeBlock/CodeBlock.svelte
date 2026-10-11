<script lang="ts">
	// Event Dispatcher
	type CodeBlockEvent = {
		copy: unknown;
	};

	// Types
	import type { CssClasses } from '../../index.js';

	import { storeHighlightJs } from './stores.js';
	import { clipboard } from '../../actions/Clipboard/clipboard.js';

	// Props (styles)

	interface Props {
		class?: string;
		oncopy?: (() => void) | undefined;
		/** Sets a language alias for Highlight.js syntax highlighting. */
		language?: string;
		/** Provide the code snippet to render. Be mindful to escape as needed! */
		code?: string;
		/** Specify if line numbers should be added to the code block */
		lineNumbers?: boolean;
		/** Provide classes to set the background color. */
		background?: CssClasses;
		/** Provided classes to set the backdrop blur. */
		blur?: CssClasses;
		/** Provide classes to set the text size. */
		text?: CssClasses;
		/** Provide classes to set the text color. */
		color?: CssClasses;
		/** Provide classes to set the border radius. */
		rounded?: CssClasses;
		/** Provide classes to set the box shadow. */
		shadow?: CssClasses;
		/** Provide classes to set the button styles. */
		button?: CssClasses;
		/** Provide the button label text. */
		buttonLabel?: string;
		/** Provide the button label text when copied. */
		buttonCopied?: string;
	}

	let {
		class: className = '',
		oncopy = undefined,
		language = 'plaintext',
		code = '',
		lineNumbers = false,
		background = 'bg-neutral-900/90',
		blur = '',
		text = 'text-sm',
		color = 'text-white',
		rounded = 'rounded-container-token',
		shadow = 'shadow',
		button = 'btn btn-sm variant-soft !text-white',
		buttonLabel = 'Copy',
		buttonCopied = '👍'
	}: Props = $props();

	// Base Classes
	const cBase = 'overflow-hidden shadow';
	const cHeader = 'text-xs text-white/50 uppercase flex justify-between items-center p-2 pl-4';
	const cPre = 'whitespace-pre-wrap break-all p-4 pt-1';

	// Local
	let formatted = $derived($storeHighlightJs !== undefined || lineNumbers);
	let displayCode = $derived.by(() => {
		let result = $storeHighlightJs
			? $storeHighlightJs.highlight(code, { language }).value.trim()
			: lineNumbers
				? code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
				: code;
		return lineNumbers ? result.replace(/^/gm, '<span class="line"></span>\t') : result;
	});
	let copyState = $state(false);

	// Allow shorthand alias, but show full text in UI
	function languageFormatter(lang: string): string {
		if (lang === 'js') return 'javascript';
		if (lang === 'ts') return 'typescript';
		if (lang === 'shell') return 'terminal';
		return lang;
	}

	// Handle Copy Text
	function onCopyClick() {
		copyState = true;
		// prettier-ignore
		setTimeout(() => { copyState = false; }, 2000);
		/** @event {} copy - Fires when the Copy button is pressed. */
		oncopy?.();
	}

	// Reactive
	let classesBase = $derived(`${cBase} ${background} ${blur} ${text} ${color} ${rounded} ${shadow} ${className ?? ''}`);
</script>

<!-- prettier-ignore -->
{#if language && code}
<div class="codeblock {classesBase}" data-testid="codeblock">
	<!-- Header -->
	<header class="codeblock-header {cHeader}">
		<!-- Language -->
		<span class="codeblock-language">{languageFormatter(language)}</span>
		<!-- Copy Button -->
		<button type="button" class="codeblock-btn {button}" onclick={onCopyClick} use:clipboard={code}>
			{!copyState ? buttonLabel : buttonCopied}
		</button>
	</header>
	<!-- Pre/Code -->
	<pre class="codeblock-pre {cPre}"><code class="codeblock-code language-{language} lineNumbers">{#if formatted}{@html displayCode}{:else}{code.trim()}{/if}</code></pre>
</div>
{/if}
