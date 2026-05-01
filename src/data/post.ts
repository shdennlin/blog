import { type CollectionEntry, getCollection } from "astro:content";

/** Return every entry in the `post` collection that should be visible.
 *  In production we honour `publish: true`. In dev we show everything so
 *  drafts can be previewed locally. The collection is named "post" but
 *  holds all content types (post / note / project / page) — filter by
 *  `data.type` to narrow.
 */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? data.publish : true;
	});
}

/** Long-form articles only. */
export async function getArticles(): Promise<CollectionEntry<"post">[]> {
	const all = await getAllPosts();
	return all.filter((p) => (p.data.type ?? "post") === "post");
}

/** TIL / short-form notes. */
export async function getNotes(): Promise<CollectionEntry<"post">[]> {
	const all = await getAllPosts();
	return all.filter((p) => p.data.type === "note");
}

/** Portfolio / project entries. */
export async function getProjects(): Promise<CollectionEntry<"post">[]> {
	const all = await getAllPosts();
	return all.filter((p) => p.data.type === "project");
}

/** Single-purpose static pages (now, uses, …) by slug id. */
export async function getStaticPage(id: string): Promise<CollectionEntry<"post"> | undefined> {
	const all = await getAllPosts();
	return all.find((p) => p.id === id && p.data.type === "page");
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: CollectionEntry<"post">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
