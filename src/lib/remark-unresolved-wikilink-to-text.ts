import type { Root } from "mdast";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";

type WikiLinkNode = {
	data?: {
		alias?: string;
		exists?: boolean;
	};
	type: "wikiLink";
	value?: string;
};

type TextNode = {
	type: "text";
	value: string;
};

type WikiLinkParent = Parent & {
	children: Array<TextNode | WikiLinkNode>;
};

/**
 * Run after remark-wiki-link. Any wikiLink whose target was not in the
 * `permalinks` allowlist (i.e. data.exists === false) is replaced with a
 * plain text node holding the original alias/value. Prevents private vault
 * notes from leaking as broken /posts/<slug>/ links.
 */
export default function remarkUnresolvedWikilinkToText() {
	return (tree: Root) => {
		visit(tree, "wikiLink" as never, (node: WikiLinkNode, index, parent) => {
			if (!parent || index === undefined) return;
			if (node.data?.exists) return;
			// Prefer alias when `[[Target|Alias]]` was used; fall back to target name.
			const text = node.data?.alias ?? node.value ?? "";
			(parent as WikiLinkParent).children[index] = { type: "text", value: text };
		});
	};
}
