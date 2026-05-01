# Blog Roadmap

Source of truth for what's planned and why. Updated as decisions change.

## Strategy

- **Source of truth**: Obsidian vault at `~/workspace/shdennlin-note/`. The
  `Blog/` folder is a symlink into this repo's `src/content/posts/`. Content
  files live in this (public) repo; vault sees them via symlink.
- **10-year mindset**: content stays portable (plain Markdown + standard
  frontmatter); framework is replaceable. See `PORTABILITY.md` for the rules.
- **Theme**: forked from Astro Cactus. We own it now — no upstream sync.

---

## Phase 0 — pre-launch

### A. Theme adoption + integration ✅
- [x] Backup current minimal scaffold to `archive/astro-minimal` branch
- [x] Fork Cactus into the repo (replace `src/`, keep our content)
- [x] Schema: replace Cactus's `draft: true` with positive `publish: true`
- [x] Port `remark-wiki-link` + unresolved-to-text plugin
- [x] Repoint vault symlink: `vault/Blog → src/content/post`
- [x] Verify `hello-world.md` renders, `draft-example.md` filtered in PROD

### B. Layout customization ✅
- [x] Full-width header band, inner max-width container
- [x] Full-width footer band, inner max-width container
- [x] Article body stays narrow (`max-w-3xl`)
- [x] Sticky TOC sidebar (already in Cactus, kept)
- [x] Mobile TOC collapses into `<details>` (already in Cactus, kept)
- [ ] Code block / image break-out — deferred (rare in practice; revisit when first wide image needs it)

### C. Content features
- [x] KaTeX math (`remark-math` + `rehype-katex`)
- [x] Obsidian callouts `> [!note]` (custom plugin → Cactus admonitions)
- [x] JSON-LD structured data injection (BlogPosting / WebSite)
- [x] Mermaid diagrams — client-side lazy load via CDN. The remark plugin
  rewrites ```mermaid blocks to `<pre class="mermaid">`; Base.astro ships a
  small inline script that only fetches mermaid.js when a `.mermaid`
  element is present. Re-renders on theme toggle. Pages without diagrams
  get zero JS cost.

### D. Safety net (public repo) ✅
- [x] Pre-commit: warn on wikilinks inside `publish: true` posts
- [x] Pre-commit: block iCloud conflict files
- [x] Pre-commit: block obvious secret patterns (basic)
- [x] Frontmatter validation via Zod schema (build-time)
- [x] `PORTABILITY.md` rules document
- [x] `core.hooksPath` wired to `scripts/git-hooks`

### E. Small launch features ✅
- [x] Reading time (Cactus default)
- [x] Code block copy button (expressive-code default)
- [x] "Edit on GitHub" link
- [x] Custom 404 page (Cactus default)

### Bonus (added later in Phase 0) ✅
- [x] `bun run lint` cleanup — biome auto-fix all formatting/import-sort
- [x] Remove `note` + `tag` collections; nav menu, RSS link, pages all gone
- [x] Tag cloud on home page (top 20 tags w/ counts)
- [x] Atom feed at `/atom.xml` alongside RSS
- [x] Custom 404 with recent-posts list
- [x] About page rewritten to match the actual project
- [x] `==highlight==` → `<mark>` (remark-highlight)
- [x] `![[image.png]]` resolution (remark-vault-images, copies to public/posts/<slug>/)
- [x] Auto `updatedDate` from git when frontmatter omits it
- [x] Smart reading time (weights code chars 1.5x)
- [x] iCloud conflict scanner (`predev`/`prebuild` hook)
- [x] Pre-commit wikilinks allowlist (`scripts/git-hooks/wikilinks-allowlist.txt`)
- [x] Cloudflare Web Analytics (opt-in via `CF_BEACON_TOKEN` env)

### F. Deploy (next)
- [ ] Push `astro` branch to GitHub
- [ ] Cloudflare Pages: connect repo, configure Bun build
- [ ] Validate on preview domain
- [ ] Cutover `main` to `astro`, DNS → `blog.shdennlin.com`

---

## Phase 1 — first month after launch

- Privacy analytics (Plausible / Cloudflare Analytics — **never GA**)
- OG image auto-generation (when we start sharing links)
- Refine "Edit on GitHub" if it ends up clunky

---

## Phase 2 — after ~20-30 posts

- **Backlinks** (50% of graph-view groundwork)
- Series / multi-part posts
- Webmentions (IndieWeb)
- Giscus comments (only after we have actual readers)
- Atom Feed alongside RSS

---

## Phase 3 — after ~50+ posts

- **Graph view** (Svelte Island, 2-3 days work)
- Plain-HTML mirror build (10-year insurance)
- Optional: AI-friendly vector index export for RAG consumers

---

## Anti-roadmap (deliberately not doing)

- Disqus comments (use Giscus)
- Mailchimp / Substack newsletter (premature until 100+ readers)
- i18n (doubles content cost)
- View counters in articles (vanity)
- Reading-progress bar (no one cares)
- Custom cursors / fancy animations (will regret in 5 years)
- Fancy CMS backend (Obsidian *is* the CMS)
- Heavy MDX usage (locks content to Astro)
