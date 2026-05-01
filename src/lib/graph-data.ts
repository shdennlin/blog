import type { CollectionEntry } from "astro:content";

/**
 * Build a node/edge graph from the published post collection.
 * Nodes: posts (id, title, tag list).
 * Edges: wikilink references between posts (directed, but we render
 * undirected). Tag-co-occurrence is not modeled as edges to keep the
 * graph readable — tags are filter facets, not relationships.
 */

const WIKILINK_RE = /\[\[([^|#\]]+)(?:[#|][^\]]*)?\]\]/g;
const CONTENT_LINK_RE = /\]\(\/(?:posts|notes|projects)\/([a-z0-9][a-z0-9-]*)\/?\)/gi;

export interface GraphNode {
	id: string;
	title: string;
	tags: string[];
	type: "post" | "note" | "project" | "page";
}
export interface GraphEdge {
	source: string;
	target: string;
}
export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

function slugify(s: string): string {
	return s.trim().replace(/\s+/g, "-").toLowerCase();
}

export function buildGraph(posts: CollectionEntry<"post">[]): GraphData {
	const published = posts.filter((p) => p.data.publish);
	const idSet = new Set(published.map((p) => p.id));
	const nodes: GraphNode[] = published.map((p) => ({
		id: p.id,
		title: p.data.title,
		tags: [...p.data.tags],
		type: p.data.type ?? "post",
	}));
	const edgeSet = new Set<string>();
	const edges: GraphEdge[] = [];

	for (const post of published) {
		const body = post.body ?? "";
		const targets = new Set<string>();
		for (const m of body.matchAll(WIKILINK_RE)) {
			const t = slugify(m[1] ?? "");
			if (t && idSet.has(t) && t !== post.id) targets.add(t);
		}
		for (const m of body.matchAll(CONTENT_LINK_RE)) {
			const t = (m[1] ?? "").toLowerCase();
			if (t && idSet.has(t) && t !== post.id) targets.add(t);
		}
		for (const t of targets) {
			const key = post.id < t ? `${post.id}|${t}` : `${t}|${post.id}`;
			if (edgeSet.has(key)) continue;
			edgeSet.add(key);
			edges.push({ source: post.id, target: t });
		}
	}

	return { nodes, edges };
}
