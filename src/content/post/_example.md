---
title: Example post (hidden)
description: Reference scaffold showing the basic structure. Copy this file when starting a new post.
publish: false
publishDate: 2026-05-01
tags: [meta]
status: seedling
lang: en
translationKey: example-post
created: 2026-05-01 20:21:30
updated: 2026-05-02 01:44:38
---

This file has `publish: false` so it never appears on the live site
in production. It does render in `bun run dev` (so you can preview the
template). Duplicate this file, change the filename, set
`publish: true`, and you're authoring.

## Inline formatting

Plain prose. **Bold**, *italic*, ~~strike~~, ==highlight==, and `inline code`.

## A callout

> [!tip] Use these freely
> Five flavors available — `note`, `tip`, `important`, `warning`, `caution`.
> See `AUTHORING.md` for the full alias map.

## A code block

```ts
function ping(): string {
	return "pong";
}
```

## Math

Inline $E = mc^2$, or block:

$$
\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

## Cross-reference

Wikilinks to other published posts resolve automatically:
`[[other-post-slug]]`. Targets that don't exist render as plain text —
no broken links, no name leaks.
