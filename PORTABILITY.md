# Content Portability Rules

These rules exist so the blog can outlive any specific framework. If Astro
disappears in 5 years, the markdown files in `src/content/post/` should still
render correctly under whatever SSG replaces it (Eleventy, Hugo, custom).

**The renderer is replaceable. The content is not.**

## Hard rules (do not violate)

1. **Plain Markdown only.** No `import` statements at the top of `.md` files.
   No JSX-style `<MyComponent />` tags inline. If you need a custom block,
   add a remark/rehype plugin in `src/lib/` that transforms standard markdown
   syntax — keep the source file portable.
2. **Standard frontmatter.** Use semantic fields (`title`, `description`,
   `publish`, `publishDate`, `tags`, `updatedDate`). Never reference framework
   paths like `layout: ./special.astro`.
3. **Wikilinks `[[name]]` only.** Use the standard Obsidian/Roam convention.
   Do not invent project-specific link syntax.
4. **Obsidian callouts `> [!note]`.** Use the GitHub/Obsidian-style block
   syntax. Do not write Cactus-style `:::note` directives directly in source —
   the `remark-obsidian-callouts` plugin translates them at build time.
5. **Math uses `$inline$` and `$$block$$`.** Standard markdown-math syntax,
   parsed by `remark-math`. No custom delimiters.
6. **Images relative to the post.** Co-locate images with the markdown file or
   reference `/public/...`. Do not use `~/` or `@/` aliases inside content.
7. **Positive `publish: true` flag.** Never default to "everything visible
   unless marked draft". Default is private; opt in to publish.

## Soft conventions

- Tags lowercase, hyphenated (`system-design`, not `System Design`).
- Date format: ISO `YYYY-MM-DD` in frontmatter.
- Filename in `kebab-case.md`, matches what becomes the URL slug.
- Titles ≤ 60 chars (enforced by Zod schema).

## What you CAN add later without violating portability

- Custom remark/rehype plugins (live in `src/lib/`, transform standard syntax).
- Astro-specific layout polish (lives in `src/layouts/`, `src/components/`).
- Per-page UI features (TOC, comments, OG image).

These all sit *above* the markdown layer — content stays clean, presentation
evolves freely.

## Things that look harmless but lock you in

- ❌ MDX components inside content (`<MyChart data={...} />`).
- ❌ Astro-specific shortcodes in the markdown body.
- ❌ Frontmatter field that names a renderer (`renderer: astro-component-x`).
- ❌ Hardcoded asset paths that depend on the build tool's processing.

## When the next migration happens

Imagine the next SSG. Mentally walk through:

1. Can it parse `src/content/post/*.md` with standard remark?
2. Can it interpret the frontmatter as plain YAML?
3. Can it resolve `[[wikilinks]]` and `> [!note]` callouts via standard plugins?

If the answer to all three is yes, migration is a weekend.

The day you say "but I really need to use this Astro-specific feature in the
content body" is the day you stop being portable. That's a valid trade-off,
but make it knowingly.
