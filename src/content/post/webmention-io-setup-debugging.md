---
title: Debugging webmention.io setup
description: Notes from setting up webmention.io and testing Webmention delivery.
publish: true
publishDate: 2026-05-02
type: note
tags: [indieweb, webmentions, debugging]
status: growing
created: 2026-05-02 03:39:35
updated: 2026-05-02 03:41:40
---

I set up webmention.io for this site today and hit two useful failure modes.

The site was already advertising the right IndieWeb links:

```html
<link href="https://github.com/shdennlin" rel="me">
<link href="https://webmention.io/blog.shdennlin.com/webmention" rel="webmention">
<link href="https://webmention.io/blog.shdennlin.com/xmlrpc" rel="pingback">
```

But my first manual Webmention test failed:

```json
{
  "error": "invalid_target",
  "error_description": "target domain not found on this account"
}
```

The problem was not Cloudflare, the HTML, or the `source` URL. The webmention.io account did not yet have `blog.shdennlin.com` added as a site. After adding the site in webmention.io, the same POST succeeded:

```text
HTTP/2 201 Created
```

```json
{
  "status": "queued",
  "summary": "Webmention was queued for processing"
}
```

Then the queued Webmention failed validation:

```json
{
  "status": "invalid_content",
  "summary": "The server did not return a recognized content type"
}
```

That was caused by using a GitHub Gist raw URL as the `source`. The raw file contained valid HTML, but the response content type was not a recognized HTML content type for webmention.io.

The useful checks:

```bash
curl -s https://blog.shdennlin.com \
  | grep -E 'rel="webmention|rel="pingback|rel="me"'
```

```bash
curl -i \
  --data-urlencode source="https://example.com/source-page" \
  --data-urlencode target="https://blog.shdennlin.com/" \
  "https://webmention.io/blog.shdennlin.com/webmention"
```

The lesson: first verify that the target page advertises the endpoint, then verify that webmention.io has the domain added to the account, then test with a real public `text/html` source page that links to the target.
