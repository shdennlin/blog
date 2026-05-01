# Deploy & Environment Variables

How to put this site on the public internet, and how to switch on each
optional integration.

## Quickstart: Cloudflare Pages

1. Push the `main` branch to GitHub: `git push origin main`
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages**
   → **Connect to Git** → choose `shdennlin/blog`.
3. Build settings:

   | Field                   | Value                |
   | ----------------------- | -------------------- |
   | Framework preset        | Astro                |
   | Build command           | `bun run build`      |
   | Build output directory  | `dist`               |
   | Root directory          | (leave empty)        |
   | Production branch       | `main`               |

4. **Environment variables** — set whichever features you want enabled
   (see the table below). Skip the rest; missing vars are graceful
   no-ops, not build errors.
5. **Custom domain** → add `blog.shdennlin.com` → follow the CNAME
   instructions Cloudflare prints.
6. Push commits to `main` → Cloudflare auto-deploys on each push. PRs
   get preview deployments at `<branch>.blog.pages.dev`.

> Cloudflare Pages auto-detects `bun.lock` and uses Bun. If for some
> reason it falls back to npm, change build command to:
> `curl -fsSL https://bun.sh/install | bash && ~/.bun/bin/bun install && ~/.bun/bin/bun run build`

## All environment variables

Every var below is **optional**. The corresponding feature is wired to
render nothing if unset.

| Variable                | Feature                            | Where to set       | Where it's read                           |
| ----------------------- | ---------------------------------- | ------------------ | ----------------------------------------- |
| `CF_BEACON_TOKEN`       | Cloudflare Web Analytics           | CF Pages env (prod) | `src/components/BaseHead.astro`           |
| `GISCUS_REPO`           | Giscus comments — set all 4        | CF Pages env       | `src/components/blog/Giscus.astro`        |
| `GISCUS_REPO_ID`        | …                                  | CF Pages env       | …                                          |
| `GISCUS_CATEGORY`       | …                                  | CF Pages env       | …                                          |
| `GISCUS_CATEGORY_ID`    | …                                  | CF Pages env       | …                                          |
| `WEBMENTION_URL`        | Webmention receive endpoint (link rel=webmention) | CF Pages env (client/public) | `src/components/BaseHead.astro` |
| `WEBMENTION_PINGBACK`   | Pingback URL (legacy)              | CF Pages env (client/public) | …                                |
| `WEBMENTION_API_KEY`    | Pull received webmentions to display | CF Pages env (server/secret) | webmentions integration |

`WEBMENTION_*` are declared in `astro.config.ts` via the typed
`envField` API; the rest read directly from `import.meta.env`.

---

## Per-feature setup

### 1. Cloudflare Web Analytics — `CF_BEACON_TOKEN`

Privacy-friendly traffic analytics. No cookies, no GDPR banner needed,
free.

1. Cloudflare dashboard → **Web Analytics** → **Add a site**.
2. Domain: `blog.shdennlin.com` (or whatever you set up).
3. Cloudflare gives you a snippet like:
   ```html
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
     data-cf-beacon='{"token": "abc123…"}'></script>
   ```
   The `token` value is what you set as `CF_BEACON_TOKEN`.
4. CF Pages → your project → **Settings** → **Environment variables**
   → add `CF_BEACON_TOKEN` to **Production** (and Preview if you want).
5. Trigger a redeploy.

The `<script>` only renders in production builds with the token set.
Empty token → no beacon, no analytics.

### 2. Giscus comments — `GISCUS_*` (4 vars)

GitHub Discussions-backed comments. No third-party DB, no tracking.

1. Make sure your blog repo (`github.com/shdennlin/blog`) is **public**.
2. Repo → **Settings** → **General** → scroll to **Features** →
   enable **Discussions**.
3. Install the Giscus app: https://github.com/apps/giscus → grant
   access to the blog repo.
4. Go to **https://giscus.app** → fill in the configurator:
   - Repository: `shdennlin/blog`
   - Page ↔ Discussions Mapping: **pathname** (matches what the
     component sets)
   - Discussion Category: pick one (e.g. `General` or create a
     `Comments` category in your Discussions tab)
   - Features: pick what you want; the component currently sets
     `data-reactions-enabled="1"`, `data-input-position="bottom"`.
5. Below the configurator giscus.app shows a generated `<script>`
   block. Copy the four `data-*` values:

   | Script attribute        | Env var               |
   | ----------------------- | --------------------- |
   | `data-repo`             | `GISCUS_REPO`         |
   | `data-repo-id`          | `GISCUS_REPO_ID`      |
   | `data-category`         | `GISCUS_CATEGORY`     |
   | `data-category-id`      | `GISCUS_CATEGORY_ID`  |

6. Set all four in CF Pages env vars. Missing **any one** → component
   renders nothing.

### 3. Webmentions (IndieWeb) — `WEBMENTION_*` (3 vars)

Receive likes / replies / mentions from other indie sites without a
database.

1. Sign up at **https://webmention.io** with your domain
   (`blog.shdennlin.com`). It uses IndieAuth; the simplest path is to
   add `<link rel="me" href="https://github.com/shdennlin">` to your
   home page (already in the layout if you ship a `<link rel="me">` —
   add it if not).
2. webmention.io will show your endpoints:

   | Their value                                     | Env var               |
   | ----------------------------------------------- | --------------------- |
   | `https://webmention.io/blog.shdennlin.com/webmention` | `WEBMENTION_URL`      |
   | `https://webmention.io/blog.shdennlin.com/xmlrpc`     | `WEBMENTION_PINGBACK` |
   | API token shown in your webmention.io dashboard       | `WEBMENTION_API_KEY`  |

3. Set in CF Pages env vars. `WEBMENTION_API_KEY` should be marked
   **Encrypted** in CF (it's a secret); the other two are public.
4. After deploy, the `<head>` of every page will advertise the
   webmention endpoint. People mentioning your URLs from their own
   sites will trigger webmentions you can display under each post.

> Bootstrapping note: webmentions only "matter" when other indie sites
> exist that link to you. Worth setting up early — even if no one
> mentions you yet, your endpoint is ready.

---

## Local development

For features that read env vars at build time, you can put them in
`.env` (gitignored) for `bun run dev`:

```bash
cp .env.example .env
# edit .env, fill the values you want to test locally
bun run dev
```

Note: Cloudflare Web Analytics only loads in production (`import.meta.env.PROD`),
so `CF_BEACON_TOKEN` doesn't activate in dev.

---

## Cutover from Hugo (one time)

If your old `main` branch still points at the Hugo site:

```bash
git checkout main
git merge astro --no-ff -m "feat: cut over to Astro rebuild"
                                    # --no-ff forces a merge commit so the
                                    # cutover is one identifiable point in
                                    # main's history (easier to revert with
                                    # `git revert -m 1 <merge-sha>`).
git push origin main                # if the remote main is also Hugo, you may need
                                    # git push --force-with-lease origin main
```

The Cloudflare Pages production branch should already be `main`.
First deploy will replace the Hugo site.

---

## Reverting

Branches preserved for emergency rollback:

| Branch                     | Recovery action                                          |
| -------------------------- | -------------------------------------------------------- |
| `archive/hugo`             | `git reset --hard archive/hugo` to restore old Hugo site |
| `archive/astro-minimal`    | First Astro scaffold (pre-Cactus)                         |
| `backup/astro-pre-squash`  | The 31-commit history of the Astro rebuild               |

---

## Things that aren't in env vars (intentionally)

- **Site URL / title / author** — `src/site.config.ts`, edit and commit.
  These are deployment-shape config, not secrets.
- **GitHub repo path** — same file. Edit-on-GitHub link uses it.
- **Tag taxonomy / nav menu** — `src/site.config.ts`, edit and commit.

If you want to fork this for a different site, those three are the
only files that need changes. Everything else is content-driven.
