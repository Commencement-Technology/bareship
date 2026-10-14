# 0016. The website lives on a subdomain for now

- Status: Accepted
- Date: 2026-10-14
- Supersedes: the "website on `bareship.dev`" part of [0015](0015-name-bareship.md)

## Context

ADR 0015 planned the website on `bareship.dev`, a domain that isn't registered yet. The maintainer already
owns `praveensingh.co.in`, hosted on Vercel with DNS at GoDaddy, and wants the site live now without buying
another domain.

## Decision

- The website is served at **`https://bareship.praveensingh.co.in`** by a Vercel project that builds
  `website/` from `main` (Root Directory `website`, files outside it included, because the site reads the
  repo's `docs/`). Every push to `main` deploys it.
- DNS: a `CNAME` record `bareship` points at Vercel; a `TXT` record `_vercel` verifies the domain, because
  the parent domain belongs to another Vercel account.
- `site` in `website/astro.config.mjs`, the npm package's `homepage` and the repository's website link use
  this address. `website/public/robots.txt` allows all crawlers and points to the sitemap.

## Consequences

- The site is live and indexable today, with a sitemap for search and AI crawlers.
- A subdomain of a personal site gets less search authority than a dedicated domain would.
- Moving to `bareship.dev` later: register it, add it to the same Vercel project, make the subdomain a
  permanent (308) redirect to it, then change `site`, `homepage` and the repository link. Old links keep
  working.

## Alternatives considered

- Buy `bareship.dev` now — a cost the project doesn't need yet.
- `bareship.vercel.app` — free, but a Vercel-branded address is harder to move without losing links.
- GitHub Pages — needs a separate deploy workflow, and Actions are switched off in this repository for now.
