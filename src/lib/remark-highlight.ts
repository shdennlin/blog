import type { Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Translate Obsidian-style ==highlight== syntax into HTML <mark> nodes.
 * Standard markdown does not include highlight; this is the Obsidian /
 * GFM-extension convention. Rendering as semantic <mark> keeps it
 * portable — any future SSG can swap in the same convention or strip it.
 */

const HIGHLIGHT_RE = /==([^=\n][^=]*?)==/g;

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function remarkHighlight() {
	return (tree: Root) => {
		visit(tree, "text", (node: Text, index, parent) => {
			if (!parent || index === undefined) return;
			const value = node.value;
			if (!value.includes("==")) return;

			const matches = [...value.matchAll(HIGHLIGHT_RE)];
			if (matches.length === 0) return;

			const segments: (Text | { type: "html"; value: string })[] = [];
			let last = 0;
			for (const m of matches) {
				if (m.index === undefined) continue;
				if (m.index > last) {
					segments.push({ type: "text", value: value.slice(last, m.index) });
				}
				segments.push({ type: "html", value: `<mark>${escapeHtml(m[1] ?? "")}</mark>` });
				last = m.index + m[0].length;
			}
			if (last < value.length) {
				segments.push({ type: "text", value: value.slice(last) });
			}

			(parent as Paragraph).children.splice(
				index,
				1,
				// biome-ignore lint/suspicious/noExplicitAny: mixing text + raw html nodes
				...(segments as any),
			);
		});
	};
}
