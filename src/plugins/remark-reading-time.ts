import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

/**
 * Reading time tuned for engineering content. Default `reading-time`
 * assumes 200 wpm prose. Code blocks need more attention per char, so
 * we scale wpm down based on the fraction of the doc that is fenced or
 * inline code (200 wpm prose-only → ~140 wpm all-code).
 */
export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return (tree, { data }) => {
		const text = mdastToString(tree);
		const codeChars = countCodeChars(tree);
		const ratio = text.length ? Math.min(codeChars / text.length, 1) : 0;
		const wpm = Math.round(200 - 60 * ratio);
		const readingTime = getReadingTime(text, { wordsPerMinute: wpm });
		data.astro.frontmatter.readingTime = readingTime.text;
	};
}

// biome-ignore lint/suspicious/noExplicitAny: mdast nodes
function countCodeChars(node: any): number {
	if (!node) return 0;
	if (node.type === "code" || node.type === "inlineCode") {
		return (node.value || "").length;
	}
	if (Array.isArray(node.children)) {
		let t = 0;
		for (const c of node.children) t += countCodeChars(c);
		return t;
	}
	return 0;
}
