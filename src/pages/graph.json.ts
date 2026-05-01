import { getAllPosts } from "@/data/post";
import { buildGraph } from "@/lib/graph-data";

export const GET = async () => {
	const posts = await getAllPosts();
	const data = buildGraph(posts);
	return new Response(JSON.stringify(data), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};
