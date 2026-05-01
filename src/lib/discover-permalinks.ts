import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Synchronous filesystem scan returning slugs of all `publish: true`
 * posts. Called at astro.config evaluation time so that remark-wiki-link
 * can be initialised with a real `permalinks` list — wikilinks to other
 * published posts then resolve to /posts/<slug>/ instead of being
 * downgraded to plain text by remark-unresolved-wikilink-to-text.
 *
 * Trade-off: we re-scan once per dev start / build (cheap). We do NOT
 * full-parse YAML — a `^publish:\s*true` regex on the frontmatter is
 * sufficient since the schema validates the value separately.
 */

const POST_DIR = "src/content/post";
const PUBLISH_RE = /^publish:\s*true\b/m;

export function discoverPublishedPermalinks(): string[] {
	const out: string[] = [];
	let entries: string[];
	try {
		entries = readdirSync(POST_DIR);
	} catch {
		return out;
	}
	for (const name of entries) {
		if (!name.endsWith(".md") && !name.endsWith(".mdx")) continue;
		const slug = name.replace(/\.(md|mdx)$/, "");
		try {
			const body = readFileSync(join(POST_DIR, name), "utf-8");
			const fm = body.split(/^---\s*$/m)[1] ?? "";
			if (PUBLISH_RE.test(fm)) out.push(slug);
		} catch {
			// skip unreadable
		}
	}
	return out;
}
