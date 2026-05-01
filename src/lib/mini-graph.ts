import type { CollectionEntry } from "astro:content";
import { buildGraph } from "./graph-data";

/**
 * Compute the local subgraph around `centerId`: the current post plus
 * its 1-hop neighbors via wikilinks and the edges among them. Used by
 * MiniGraph.astro for the per-post sidebar visualization.
 */

export interface MiniNode {
	id: string;
	title: string;
	type: "post" | "note" | "project" | "page";
	x: number;
	y: number;
	isCenter: boolean;
}
export interface MiniEdge {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	involvesCenter: boolean;
}

const RADIUS = 70; // pixels from center
const CENTER_X = 90;
const CENTER_Y = 90;
const URL_PREFIX: Record<MiniNode["type"], string> = {
	post: "posts",
	note: "notes",
	project: "projects",
	page: "",
};

export function pathForMiniNode(node: Pick<MiniNode, "id" | "type">): string {
	const prefix = URL_PREFIX[node.type];
	return prefix ? `/${prefix}/${node.id}/` : `/${node.id}/`;
}

export function buildMiniGraph(
	centerId: string,
	posts: CollectionEntry<"post">[],
): { nodes: MiniNode[]; edges: MiniEdge[]; total: number } {
	const full = buildGraph(posts);
	const titleOf = new Map(full.nodes.map((n) => [n.id, n.title]));
	const typeOf = new Map(full.nodes.map((n) => [n.id, n.type]));

	// 1-hop neighbors of centerId
	const neighborIds = new Set<string>();
	for (const e of full.edges) {
		if (e.source === centerId) neighborIds.add(e.target);
		else if (e.target === centerId) neighborIds.add(e.source);
	}
	const neighbors = [...neighborIds];

	// Layout: center + ring
	const nodes: MiniNode[] = [];
	if (titleOf.has(centerId)) {
		nodes.push({
			id: centerId,
			title: titleOf.get(centerId) ?? centerId,
			type: typeOf.get(centerId) ?? "post",
			x: CENTER_X,
			y: CENTER_Y,
			isCenter: true,
		});
	}
	const n = neighbors.length;
	neighbors.forEach((id, i) => {
		const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
		nodes.push({
			id,
			title: titleOf.get(id) ?? id,
			type: typeOf.get(id) ?? "post",
			x: CENTER_X + RADIUS * Math.cos(angle),
			y: CENTER_Y + RADIUS * Math.sin(angle),
			isCenter: false,
		});
	});

	const pos = new Map(nodes.map((m) => [m.id, m]));
	const edges: MiniEdge[] = [];
	for (const e of full.edges) {
		const a = pos.get(e.source);
		const b = pos.get(e.target);
		if (!a || !b) continue;
		edges.push({
			x1: a.x,
			y1: a.y,
			x2: b.x,
			y2: b.y,
			involvesCenter: a.isCenter || b.isCenter,
		});
	}

	return { nodes, edges, total: nodes.length };
}
