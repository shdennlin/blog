import type { CollectionEntry } from "astro:content";

/**
 * Group posts by their `series` frontmatter field. Within a series,
 * posts are sorted by `seriesOrder` if present, otherwise by publishDate
 * ascending (oldest first — series read chronologically).
 *
 * Series slug = lowercase, hyphenated form of the series name. Used in
 * URL paths /series/<slug>/.
 */

export interface SeriesNeighbors {
	name: string;
	slug: string;
	current: number; // 1-based
	total: number;
	prev?: { id: string; title: string };
	next?: { id: string; title: string };
}

export function seriesSlug(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function sortInSeries(posts: CollectionEntry<"post">[]): CollectionEntry<"post">[] {
	return [...posts].sort((a, b) => {
		const ao = a.data.seriesOrder ?? Number.POSITIVE_INFINITY;
		const bo = b.data.seriesOrder ?? Number.POSITIVE_INFINITY;
		if (ao !== bo) return ao - bo;
		return a.data.publishDate.getTime() - b.data.publishDate.getTime();
	});
}

export function groupBySeries(
	posts: CollectionEntry<"post">[],
): Map<string, CollectionEntry<"post">[]> {
	const groups = new Map<string, CollectionEntry<"post">[]>();
	for (const post of posts) {
		const name = post.data.series;
		if (!name) continue;
		const list = groups.get(name) ?? [];
		list.push(post);
		groups.set(name, list);
	}
	for (const [name, list] of groups) {
		groups.set(name, sortInSeries(list));
	}
	return groups;
}

export function getSeriesNeighbors(
	post: CollectionEntry<"post">,
	posts: CollectionEntry<"post">[],
): SeriesNeighbors | undefined {
	const name = post.data.series;
	if (!name) return undefined;
	const groups = groupBySeries(posts);
	const list = groups.get(name);
	if (!list) return undefined;
	const idx = list.findIndex((p) => p.id === post.id);
	if (idx < 0) return undefined;
	const prev = list[idx - 1];
	const next = list[idx + 1];
	return {
		name,
		slug: seriesSlug(name),
		current: idx + 1,
		total: list.length,
		...(prev ? { prev: { id: prev.id, title: prev.data.title } } : {}),
		...(next ? { next: { id: next.id, title: next.data.title } } : {}),
	};
}
