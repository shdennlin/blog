---
title: Cloudflare Pages and Bun install mismatch
description: Debugging a Cloudflare Pages build that installed dependencies with npm but built with Bun.
publish: true
publishDate: 2026-05-02
type: note
tags: [cloudflare, bun, deployment]
status: growing
created: 2026-05-02 03:39:35
updated: 2026-05-02 03:41:34
---

Today I hit a Cloudflare Pages build failure where the local build passed, but the deployed build failed inside Vite/Tailwind:

```text
[@tailwindcss/vite:generate:build] Missing field `tsconfigPaths` on BindingViteResolvePluginConfig.resolveOptions
```

The important part of the Cloudflare log was not the Tailwind error itself. It was the install/build mismatch:

```text
Installing project dependencies: npm install --progress=false
Executing user command: bun run build
```

This repo uses `bun.lock`, but Cloudflare installed dependencies with `npm`. That means the deploy could resolve a different dependency graph than the local Bun install, then run the build with Bun against those npm-installed packages.

The local check was useful because `bun run build` passed with the committed Bun lockfile. That narrowed the issue to Cloudflare's build environment and install strategy, not the app code.

The fix is to make Cloudflare use Bun for dependency installation too:

```bash
bun install --frozen-lockfile && bun run build
```

And set this Cloudflare Pages environment variable:

```text
SKIP_DEPENDENCY_INSTALL=true
```

Optionally pin Bun as well:

```text
BUN_VERSION=1.3.10
```

The lesson: when debugging static-site deploy failures, check the package manager used for installation separately from the package manager used for the build command. A passing local build does not mean much if the deploy is building against a different dependency tree.
