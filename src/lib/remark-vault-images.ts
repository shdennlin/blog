import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import type { Image, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Resolve Obsidian-style `![[image.png]]` and `![[image.png|320]]` image
 * embeds. Looks for the file relative to the markdown source. If found,
 * the image is copied into `public/posts/<slug>/<file>` at build time and
 * the AST node is replaced with a standard markdown image so Astro's
 * normal image / prose pipeline picks it up.
 *
 * The `|width` modifier is honored as inline `<img width="…">` via raw
 * HTML (markdown image syntax has no width support).
 *
 * Files referenced by `![[X]]` that do NOT exist near the post are left
 * to remarkObsidianStrip (which removes them silently). Better than
 * shipping broken image links to readers.
 */

const EMBED_RE = /^!\[\[([^|\]]+)(?:\|(\d+))?\]\]$/;
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

const projectRoot = resolve(process.cwd());
const publicRoot = join(projectRoot, "public", "posts");

interface VfileLike {
	path?: string;
	history?: string[];
}

export default function remarkVaultImages() {
	return (tree: Root, file: VfileLike) => {
		const sourcePath = file.path ?? file.history?.[file.history.length - 1];
		if (!sourcePath) return;
		const sourceDir = dirname(sourcePath);
		const slug = basename(sourcePath, extname(sourcePath));

		visit(tree, "paragraph", (para: Paragraph, paraIndex, paraParent) => {
			if (!paraParent || paraIndex === undefined) return;
			if (para.children.length !== 1) return;
			const only = para.children[0];
			if (!only || only.type !== "text") return;
			const m = (only as Text).value.trim().match(EMBED_RE);
			if (!m) return;
			const [, name, widthStr] = m;
			if (!name) return;
			if (!IMAGE_EXT.has(extname(name).toLowerCase())) return;

			const candidate = join(sourceDir, name);
			if (!existsSync(candidate)) return; // let strip plugin handle it

			// Copy into public/posts/<slug>/ if not already there.
			const destDir = join(publicRoot, slug);
			mkdirSync(destDir, { recursive: true });
			const dest = join(destDir, basename(name));
			try {
				copyFileSync(candidate, dest);
			} catch {
				return;
			}

			const url = `/posts/${slug}/${basename(name)}`;
			if (widthStr) {
				paraParent.children[paraIndex] = {
					type: "html",
					value: `<img src="${url}" alt="${escapeAttr(name)}" width="${widthStr}" />`,
				} as Paragraph["children"][number];
			} else {
				const img: Image = { type: "image", url, alt: name };
				paraParent.children[paraIndex] = {
					type: "paragraph",
					children: [img],
				};
			}
		});
	};
}

function escapeAttr(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
