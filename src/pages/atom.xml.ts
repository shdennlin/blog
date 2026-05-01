import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";

function xmlEscape(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export const GET = async () => {
	const posts = (await getAllPosts()).sort(
		(a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
	);
	const updated = posts[0]?.data.updatedDate ?? posts[0]?.data.publishDate ?? new Date();
	const site = siteConfig.url.replace(/\/$/, "");

	const entries = posts
		.map((post) => {
			const url = `${site}/posts/${post.id}/`;
			const updatedAt = (post.data.updatedDate ?? post.data.publishDate).toISOString();
			return `  <entry>
    <title>${xmlEscape(post.data.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${updatedAt}</updated>
    <published>${post.data.publishDate.toISOString()}</published>
    <summary>${xmlEscape(post.data.description)}</summary>
    <author><name>${xmlEscape(siteConfig.author)}</name></author>
  </entry>`;
		})
		.join("\n");

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEscape(siteConfig.title)}</title>
  <subtitle>${xmlEscape(siteConfig.description)}</subtitle>
  <link href="${site}/atom.xml" rel="self"/>
  <link href="${site}/"/>
  <id>${site}/</id>
  <updated>${updated.toISOString()}</updated>
  <author><name>${xmlEscape(siteConfig.author)}</name></author>
${entries}
</feed>
`;

	return new Response(xml, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
};
