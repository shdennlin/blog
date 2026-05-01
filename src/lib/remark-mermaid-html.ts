import type { Code, Html, Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Convert ```mermaid code blocks into raw `<pre class="mermaid">…</pre>`
 * HTML nodes BEFORE expressive-code (or any other code-block styler) sees
 * them. The browser-side mermaid.js script in Base.astro then takes over
 * and replaces them with rendered SVG diagrams.
 *
 * Why not rehype-mermaid? Its default strategies require playwright
 * (~300 MB) for build-time SSR. We prefer a tiny client-side loader that
 * only ships when a page actually contains a diagram.
 */

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export default function remarkMermaidHtml() {
	return (tree: Root) => {
		visit(tree, "code", (node: Code, index, parent) => {
			if (!parent || index === undefined) return;
			if (node.lang !== "mermaid") return;
			const html: Html = {
				type: "html",
				value: `<pre class="mermaid not-prose">${escapeHtml(node.value)}</pre>`,
			};
			parent.children[index] = html;
		});
	};
}
