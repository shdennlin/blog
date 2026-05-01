import type { CollectionEntry } from "astro:content";

/**
 * Build-time backlink graph and the published-post permalink list.
 *
 * Two outputs from the same pass over content:
 *
 *   getPublishedPermalinks(posts)
 *     Slug list of all `publish: true` posts. Fed to remark-wiki-link's
 *     `permalinks` so that `[[other-post]]` resolves to a real /posts/<slug>/
 *     link instead of being downgraded to plain text.
 *
 *   getBacklinks(targetId, posts)
 *     For a given post, list of other posts whose body wikilinks-to or
 *     plain-links-to this one. Cached on the posts argument.
 *
 * Why not use remark to do this? The wikilink plugin runs per-file and
 * has no global view. We do a second crude regex pass over the raw
 * markdown body — not perfect, but good enough for an authoring aid
 * (false negatives just mean "missed backlink", never wrong info).
 */

const WIKILINK_RE = /\[\[([^|#\]]+)(?:[#|][^\]]*)?\]\]/g;
const POST_LINK_RE = /\]\(\/posts\/([a-z0-9][a-z0-9-]*)\/?\)/gi;

export interface BacklinkEntry {
	id: string;
	title: string;
	description: string;
}

interface BacklinkCache {
	bySlug: Map<string, BacklinkEntry[]>;
	permalinks: string[];
}

const cache = new WeakMap<object, BacklinkCache>();

function slugify(name: string): string {
	return name.trim().replace(/\s+/g, "-").toLowerCase();
}

function build(posts: CollectionEntry<"post">[]): BacklinkCache {
	const published = posts.filter((p) => p.data.publish);
	const idSet = new Set(published.map((p) => p.id));
	const bySlug = new Map<string, BacklinkEntry[]>();

	for (const post of published) {
		const body = post.body ?? "";
		const targets = new Set<string>();

		for (const match of body.matchAll(WIKILINK_RE)) {
			const target = slugify(match[1] ?? "");
			if (target && idSet.has(target) && target !== post.id) {
				targets.add(target);
			}
		}
		for (const match of body.matchAll(POST_LINK_RE)) {
			const target = (match[1] ?? "").toLowerCase();
			if (target && idSet.has(target) && target !== post.id) {
				targets.add(target);
			}
		}

		for (const target of targets) {
			const list = bySlug.get(target) ?? [];
			list.push({
				id: post.id,
				title: post.data.title,
				description: post.data.description,
			});
			bySlug.set(target, list);
		}
	}

	return { bySlug, permalinks: published.map((p) => p.id) };
}

function getCache(posts: CollectionEntry<"post">[]): BacklinkCache {
	const c = cache.get(posts);
	if (c) return c;
	const fresh = build(posts);
	cache.set(posts, fresh);
	return fresh;
}

export function getBacklinks(targetId: string, posts: CollectionEntry<"post">[]): BacklinkEntry[] {
	return getCache(posts).bySlug.get(targetId) ?? [];
}

export function getPublishedPermalinks(posts: CollectionEntry<"post">[]): string[] {
	return getCache(posts).permalinks;
}
