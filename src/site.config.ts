import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	url: "https://blog.shdennlin.com/",
	title: "Shawn Lin",
	author: "Shawn Lin",
	description: "Engineering notes & ideas, sourced from my Obsidian vault.",
	lang: "en",
	ogLocale: "en_US",
	githubRepo: "shdennlin/blog",
	contentPath: "src/content/post",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-US",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
};

// Used to generate links in both the Header & Footer.
/** Primary nav: shown in header on every page. Keep ≤ 7 — these are
 *  the routes most readers want most of the time (content + discovery
 *  + about). */
export const menuLinks: { path: string; title: string }[] = [
	{ path: "/", title: "Home" },
	{ path: "/posts/", title: "Posts" },
	{ path: "/projects/", title: "Projects" },
	{ path: "/tags/", title: "Tags" },
	{ path: "/graph/", title: "Graph" },
	{ path: "/notes/", title: "Notes" },
	{ path: "/about/", title: "About" },
];

/** Secondary nav: only shown in footer. Personality / meta pages —
 *  useful but not what readers come for. Keeps the header uncluttered
 *  while still letting visitors discover them as a site-map row. */
export const footerExtraLinks: { path: string; title: string }[] = [
	{ path: "/now/", title: "Now" },
	{ path: "/uses/", title: "Uses" },
	{ path: "/series/", title: "Series" },
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		// If one dark and one light theme are available
		// generate theme CSS selectors compatible with cactus-theme dark mode switch
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		// return default selector
		return `[data-theme="${theme.name}"]`;
	},
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ["dracula", "github-light"],
	useThemedScrollbars: false,
};
