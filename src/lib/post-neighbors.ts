import type { CollectionEntry } from "astro:content";

/**
 * Return prev/next entries within the same content type, sorted oldest
 * → newest by publishDate. "Older" reads naturally as "previous" and
 * "newer" as "next" — matching what most blog navigation expects.
 *
 * Notes navigate among notes, projects among projects, posts among
 * posts. Mixing types in a single chronological feed would be jarring
 * (a TIL between two long essays).
 */

export interface NeighborLink {
	id: string;
	title: string;
	type: "post" | "note" | "project" | "page";
}

const URL_PREFIX: Record<NeighborLink["type"], string> = {
	post: "posts",
	note: "notes",
	project: "projects",
	page: "",
};

export function pathFor(n: NeighborLink): string {
	const prefix = URL_PREFIX[n.type];
	return prefix ? `/${prefix}/${n.id}/` : `/${n.id}/`;
}

export function getNeighbors(
	current: CollectionEntry<"post">,
	all: CollectionEntry<"post">[],
): { prev?: NeighborLink; next?: NeighborLink } {
	const type = current.data.type ?? "post";
	if (type === "page") return {}; // /now/, /uses/ aren't part of a feed
	const sameType = all.filter((p) => (p.data.type ?? "post") === type);
	const sorted = [...sameType].sort(
		(a, b) => a.data.publishDate.getTime() - b.data.publishDate.getTime(),
	);
	const idx = sorted.findIndex((p) => p.id === current.id);
	if (idx < 0) return {};
	const prev = sorted[idx - 1];
	const next = sorted[idx + 1];
	const toLink = (p: CollectionEntry<"post">): NeighborLink => ({
		id: p.id,
		title: p.data.title,
		type: (p.data.type ?? "post") as NeighborLink["type"],
	});
	return {
		prev: prev ? toLink(prev) : undefined,
		next: next ? toLink(next) : undefined,
	};
}
