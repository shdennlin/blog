import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string().max(60);

const baseSchema = z.object({
	title: titleSchema,
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			publish: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
			/** Optional series name. Posts sharing the same series are grouped on /series/<slug>/. */
			series: z.string().optional(),
			/** Position within the series (1-based). Used for prev/next nav. */
			seriesOrder: z.number().int().positive().optional(),
			/**
			 * Content type. Drives URL prefix and listing page.
			 *   post    — long-form articles, /posts/
			 *   note    — TIL / short-form, /notes/
			 *   project — portfolio entry, /projects/
			 *   page    — single static page (now, uses, …), addressed directly
			 */
			type: z.enum(["post", "note", "project", "page"]).default("post"),
			/**
			 * Maturity badge (digital-garden style). Renders a small color marker
			 * so readers know whether a note is fresh or settled.
			 */
			status: z.enum(["seedling", "growing", "evergreen"]).optional(),
			/**
			 * BCP-47 language tag for this post. Defaults to the site language.
			 * Drives <html lang="…"> and the translation switcher's labels.
			 */
			lang: z.string().optional(),
			/**
			 * Free-form id shared between translations of the same content.
			 * Posts with the same translationKey are linked from each other's
			 * "Also available in" switcher. Omit if not translated.
			 */
			translationKey: z.string().optional(),
		}),
});

export const collections = { post };
