# shdennlin / blog

Engineering notes & ideas, sourced from my Obsidian vault.

> **Strategy in one line:** content lives as plain Markdown in a public
> repo and is mounted into a private Obsidian vault via symlink. The
> renderer (Astro) is replaceable; the markdown is forever.

Live: https://blog.shdennlin.com

## How it's built

```
~/workspace/blog/                            (this repo, public)
├── src/content/post/                        ← real markdown lives here
│   ├── hello-world.md                       ← type: post
│   ├── now.md                               ← type: page
│   └── …
├── templates/Decision Log.md                ← Obsidian template
├── src/lib/remark-*.ts                      ← portability plugins
├── scripts/git-hooks/                       ← pre-commit safety net
└── …

~/shdennlin-note/Blog              ─sym→ blog/src/content/post
~/shdennlin-note/Obsidian/Templates ─sym→ blog/templates
```

Forked from [Cactus](https://github.com/chrismwilliams/astro-theme-cactus)
(MIT). Customisations are documented as commits.

## Reading order

| Document            | What it is                                       |
| ------------------- | ------------------------------------------------ |
| `AUTHORING.md`      | How to write content — frontmatter, callouts, wikilinks, status, series. **Start here when writing a post.** |
| `PORTABILITY.md`    | Hard rules for keeping content framework-agnostic so the next migration is a weekend. |
| `ROADMAP.md`        | What's planned, in progress, deliberately not doing. |

## Run it

```bash
bun install
bun run dev          # http://localhost:4321
```

Common commands:

```bash
bun run build        # static build to dist/
bun run preview      # preview the production build
bun run check        # astro check + biome check
bun run lint         # biome auto-fix
```

> Bun ≥ 1.3, Node ≥ 22.12.

## Notable features

| Feature                     | Where                                            |
| --------------------------- | ------------------------------------------------ |
| Obsidian callouts → admonitions   | `src/lib/remark-obsidian-callouts.ts`            |
| Wikilinks (resolved + private)    | `src/lib/remark-unresolved-wikilink-to-text.ts`  |
| Image embeds `![[X.png\|320]]`    | `src/lib/remark-vault-images.ts`                 |
| Highlight `==text==`              | `src/lib/remark-highlight.ts`                    |
| Mermaid (lazy-loaded CDN)         | `src/lib/remark-mermaid-html.ts` + `Base.astro`  |
| KaTeX math                        | `remark-math` + `rehype-katex`                   |
| Backlinks                         | `src/lib/backlinks.ts`                           |
| Per-post mini-graph (build-time SVG) | `src/lib/mini-graph.ts`                       |
| Full graph view (`/graph/`)       | `src/pages/graph.astro` (D3 lazy from CDN)       |
| Series (multi-part posts)         | `src/lib/series.ts`                              |
| Tags + tag cloud                  | `src/data/post.ts`                               |
| Auto `updatedDate` from git       | `src/lib/git-updated.ts`                         |
| Smart reading time (code-weighted)| `src/plugins/remark-reading-time.ts`             |
| iCloud conflict scanner           | `scripts/check-vault-conflicts.mjs`              |
| Pre-commit safety hooks           | `scripts/git-hooks/pre-commit`                   |
| JSON-LD structured data           | `src/components/BaseHead.astro`                  |
| Giscus comments (env-gated)       | `src/components/blog/Giscus.astro`               |
| Cloudflare Web Analytics (env-gated) | `src/components/BaseHead.astro`               |

Search is Pagefind (built into the header), feeds at `/rss.xml` and
`/atom.xml`, sitemap auto-generated.

## Content types

| Type      | URL                  |
| --------- | -------------------- |
| `post`    | `/posts/<slug>/`     |
| `note`    | `/notes/<slug>/`     |
| `project` | `/projects/<slug>/`  |
| `page`    | `/<id>/` (now, uses) |

See `AUTHORING.md` for when to use which.

## Environment variables (optional)

| Variable                | Effect                                                  |
| ----------------------- | ------------------------------------------------------- |
| `CF_BEACON_TOKEN`       | Enables Cloudflare Web Analytics in production          |
| `GISCUS_REPO`           | Enables Giscus comments — set all four below to enable  |
| `GISCUS_REPO_ID`        |                                                          |
| `GISCUS_CATEGORY`       |                                                          |
| `GISCUS_CATEGORY_ID`    |                                                          |
| `WEBMENTION_URL`        | Webmentions endpoint (IndieWeb)                         |
| `WEBMENTION_API_KEY`    | Server-side webmention API token                        |

If a variable is unset, the corresponding feature renders nothing —
graceful no-op, not a build error.

## Branches

| Branch              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `astro`             | Active development (this is current)     |
| `archive/hugo`      | Pre-rewrite Hugo site, kept for history  |
| `archive/astro-minimal` | First Astro scaffold before Cactus fork |
| `main`              | Holds whatever's deployed                |

## License

MIT for source code (inherited from Cactus).
Content under `src/content/post/` © shdennlin unless noted otherwise.
