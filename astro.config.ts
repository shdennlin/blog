import fs from "node:fs";
// Rehype plugins
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeUnwrapImages from "rehype-unwrap-images";
// Remark plugins
import remarkDirective from "remark-directive"; /* Handle ::: directives as nodes */
import remarkMath from "remark-math";
import wikiLinkPlugin from "remark-wiki-link";
import { discoverPublishedPermalinks } from "./src/lib/discover-permalinks";
import remarkHighlight from "./src/lib/remark-highlight";
import remarkMermaidHtml from "./src/lib/remark-mermaid-html";
import remarkObsidianCallouts from "./src/lib/remark-obsidian-callouts";
import remarkObsidianStrip from "./src/lib/remark-obsidian-strip";
import remarkUnresolvedWikilinkToText from "./src/lib/remark-unresolved-wikilink-to-text";
import remarkVaultImages from "./src/lib/remark-vault-images";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; /* Add admonitions */
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
	site: siteConfig.url,
	image: {
		domains: ["webmention.io"],
	},
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		sitemap(),
		mdx(),
		robotsTxt(),
		webmanifest({
			// See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
			name: siteConfig.title,
			short_name: "Astro_Cactus", // optional
			description: siteConfig.description,
			lang: siteConfig.lang,
			icon: "public/icon.svg", // the source for generating favicon & icons
			icons: [
				{
					src: "icons/apple-touch-icon.png", // used in src/components/BaseHead.astro L:26
					sizes: "180x180",
					type: "image/png",
				},
				{
					src: "icons/icon-192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "icons/icon-512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
			start_url: "/",
			background_color: "#1d1f21",
			theme_color: "#2bbc8a",
			display: "standalone",
			config: {
				insertFaviconLinks: false,
				insertThemeColorMeta: false,
				insertManifestLink: false,
			},
		}),
	],
	markdown: {
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
			[
				rehypeExternalLinks,
				{
					rel: ["noreferrer", "noopener"],
					target: "_blank",
				},
			],
			rehypeUnwrapImages,
			rehypeKatex,
		],
		remarkPlugins: [
			remarkReadingTime,
			remarkVaultImages,
			remarkObsidianStrip,
			remarkHighlight,
			remarkMermaidHtml,
			remarkDirective,
			remarkGithubCard,
			remarkObsidianCallouts,
			remarkAdmonitions,
			remarkMath,
			[
				wikiLinkPlugin,
				{
					// Populated at config eval time from filesystem so wikilinks to
					// other published posts resolve to real links. Unresolved ones
					// still flow through remark-unresolved-wikilink-to-text below.
					permalinks: discoverPublishedPermalinks(),
					pageResolver: (name: string) => [name.replace(/ /g, "-").toLowerCase()],
					hrefTemplate: (permalink: string) => `/posts/${permalink}/`,
					aliasDivider: "|",
					wikiLinkClassName: "internal-link",
					newClassName: "new-link",
				},
			],
			remarkUnresolvedWikilinkToText,
		],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
	},
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [tailwind(), rawFonts([".ttf", ".woff"])],
	},
	env: {
		schema: {
			WEBMENTION_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
			WEBMENTION_URL: envField.string({ context: "client", access: "public", optional: true }),
			WEBMENTION_PINGBACK: envField.string({ context: "client", access: "public", optional: true }),
		},
	},
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
