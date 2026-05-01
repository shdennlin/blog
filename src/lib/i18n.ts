import type { CollectionEntry } from "astro:content";
import { siteConfig } from "@/site.config";

/**
 * Minimal-viable i18n: posts opt in by sharing a `translationKey` and
 * declaring their own `lang`. We never split routes — translations
 * live at sibling slugs (e.g. /posts/foo/ + /posts/foo-zh/) and link
 * to each other via the switcher.
 *
 * Why translationKey instead of "translations: [...]" arrays?
 * Two-way arrays drift out of sync (add a third translation, you must
 * remember to update two existing files). A shared key is one source of
 * truth — relations emerge from data, not from manual bookkeeping.
 */

const LANG_LABELS: Record<string, string> = {
	en: "English",
	"en-US": "English",
	"zh-TW": "繁體中文",
	"zh-CN": "简体中文",
	ja: "日本語",
	ko: "한국어",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
};

export function langOf(post: CollectionEntry<"post">): string {
	return post.data.lang ?? siteConfig.lang ?? "en";
}

export function langLabel(lang: string): string {
	return LANG_LABELS[lang] ?? lang;
}

/** Posts that share the current post's translationKey, excluding self. */
export function getTranslations(
	post: CollectionEntry<"post">,
	all: CollectionEntry<"post">[],
): CollectionEntry<"post">[] {
	const key = post.data.translationKey;
	if (!key) return [];
	return all.filter((p) => p.id !== post.id && p.data.translationKey === key);
}
