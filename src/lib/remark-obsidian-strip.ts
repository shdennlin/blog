import type { Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Strip Obsidian-only constructs that have no rendered meaning on the
 * public site:
 *
 *   - %% comment %%      → removed entirely (privacy: Obsidian comments
 *                          are author-only notes, must NEVER ship)
 *   - ![[transclusion]]  → removed (we don't support transclusion yet;
 *                          better to drop than render literal `![[X]]`)
 *   - ^block-id          → trailing block-reference markers stripped
 *
 * Inline `#tag` is intentionally NOT stripped; tags belong in frontmatter
 * and inline-tag-as-content is a stylistic choice we leave to the author.
 */

const COMMENT_RE = /%%[\s\S]*?%%/g;
const TRANSCLUSION_RE = /!\[\[[^\]]+\]\]/g;
const BLOCK_REF_RE = /\s\^[a-z0-9][a-z0-9-]{0,30}(?=\s|$)/gi;

export default function remarkObsidianStrip() {
	return (tree: Root) => {
		visit(tree, "text", (node: Text) => {
			let v = node.value;
			v = v.replace(COMMENT_RE, "");
			v = v.replace(TRANSCLUSION_RE, "");
			v = v.replace(BLOCK_REF_RE, "");
			node.value = v;
		});
	};
}
