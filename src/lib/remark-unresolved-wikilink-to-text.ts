import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Run after remark-wiki-link. Any wikiLink whose target was not in the
 * `permalinks` allowlist (i.e. data.exists === false) is replaced with a
 * plain text node holding the original alias/value. Prevents private vault
 * notes from leaking as broken /posts/<slug>/ links.
 */
export default function remarkUnresolvedWikilinkToText() {
	return (tree: Root) => {
		visit(tree, "wikiLink" as any, (node: any, index, parent: any) => {
			if (!parent || index === undefined) return;
			if (node.data?.exists) return;
			// Prefer alias when `[[Target|Alias]]` was used; fall back to target name.
			const text = node.data?.alias ?? node.value ?? "";
			parent.children[index] = { type: "text", value: text };
		});
	};
}
