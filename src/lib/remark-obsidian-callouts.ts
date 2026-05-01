import type { Blockquote, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Translate Obsidian-style callouts written in markdown source into the
 * `:::type` directive form that the Cactus admonitions plugin already
 * understands. Lets us keep using Obsidian's native syntax in the vault
 * without forking remark-admonitions.
 *
 * Input  (Obsidian):
 *   > [!note] Optional title
 *   > body line 1
 *   > body line 2
 *
 * Output (mdast — handed off to remarkAdmonitions):
 *   containerDirective name="note", with paragraph children.
 *
 * Supported types: note, tip, important, warning, caution (mapped to the
 * five admonition variants Cactus's stylesheet handles).
 */

const TYPE_MAP: Record<string, string> = {
	note: "note",
	info: "note",
	abstract: "note",
	summary: "note",
	tldr: "note",
	tip: "tip",
	hint: "tip",
	important: "important",
	success: "tip",
	check: "tip",
	done: "tip",
	question: "tip",
	help: "tip",
	faq: "tip",
	warning: "warning",
	attention: "warning",
	caution: "caution",
	danger: "caution",
	error: "caution",
	bug: "caution",
	failure: "caution",
	fail: "caution",
	missing: "caution",
	example: "note",
	quote: "note",
	cite: "note",
};

const CALLOUT_RE = /^\[!(\w+)\][-+]?\s*(.*)$/;

export default function remarkObsidianCallouts() {
	return (tree: Root) => {
		visit(tree, "blockquote", (node: Blockquote, index, parent) => {
			if (!parent || index === undefined) return;
			const first = node.children[0];
			if (!first || first.type !== "paragraph") return;
			const firstText = first.children[0];
			if (!firstText || firstText.type !== "text") return;

			const lines = (firstText as Text).value.split("\n");
			const headerLine = lines[0];
			const match = headerLine?.match(CALLOUT_RE);
			if (!match) return;

			const rawType = (match[1] ?? "note").toLowerCase();
			const variant = TYPE_MAP[rawType] ?? "note";
			const title = match[2]?.trim();

			const remainingFirstLine = lines.slice(1).join("\n");
			const newFirstParagraph: Paragraph = {
				type: "paragraph",
				children: [
					{ type: "text", value: remainingFirstLine },
					...(first.children.slice(1) as Paragraph["children"]),
				],
			};

			const directiveChildren: Paragraph[] = [];
			if (newFirstParagraph.children.length > 0 && remainingFirstLine.trim()) {
				directiveChildren.push(newFirstParagraph);
			}
			for (const child of node.children.slice(1)) {
				if (child.type === "paragraph") directiveChildren.push(child);
			}

			parent.children[index] = {
				type: "containerDirective",
				name: variant,
				attributes: title ? { title } : {},
				children: directiveChildren.length
					? directiveChildren
					: [{ type: "paragraph", children: [{ type: "text", value: "" }] }],
				// biome-ignore lint/suspicious/noExplicitAny: mdast directive nodes aren't in core mdast types
			} as any;
		});
	};
}
