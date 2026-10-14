# 0015. The template is named Bareship

- Status: Accepted
- Date: 2026-10-14
- Supersedes: the "Name (A6)" part of [0001](0001-scope-and-two-tracks.md)

## Context

ADR 0001 kept the working name `rn-template` until a final name was chosen. That name can't be found:
dozens of repositories and packages use it, so neither search engines nor AI answer engines can tell this
template apart from the others. People search for "React Native template", "boilerplate" and "starter
kit"; an engine cites a product it can identify by a unique name.

The React Native CLI also constrains the app's own name inside the template. `init MyApp --template …`
replaces the placeholder, its lowercase form, `com.<placeholder>` and the title placeholder in every file
of the new app. A placeholder equal to the brand would rewrite every mention of the brand (links to the
website, the npm name, the code markers) in each new app.

## Decision

- **Brand: Bareship.** "Bare" React Native, ready to ship. On 2026-10-14 the npm name, the GitHub
  organisation, `bareship.dev` and `bareship.app` were free, no GitHub repository used the name, and no
  product or trademark using it was found.
- **Definition, used first wherever the project describes itself:** "Bareship is a production-ready,
  offline-first bare React Native template for teams and AI agents." The search terms (template,
  boilerplate, starter kit, offline-first, bare) go in the description, npm keywords and GitHub topics,
  not in the name.
- **npm package `bareship`** (`--template bareship`), **repository `psingh2907/bareship`**, website on
  `bareship.dev`, code markers `[bareship]`. *The website moved to a subdomain for now:
  [0016](0016-website-on-a-subdomain.md).*
- **The app inside the template is the brand plus "App"** (written here in parts, because `init` rewrites
  the whole word): `Bareship` + `App` names the Xcode project and schemes, the display name and the CLI
  placeholder; its lowercase form gives the bundle id (`com.` + `bareship` + `app`) and the URL scheme.
  Neither form occurs inside the brand, so `init` renames the app and leaves the brand alone.

## Consequences

- Write Bareship when you mean the project, never the app's placeholder name. The template check
  (`scripts/ci/check-template-init.sh`) fails if the placeholder survives `init`.
- The GitHub repository must be renamed to `bareship` when this change is pushed: the links already
  point there. GitHub redirects the old URL.
- Before going public: a formal trademark search, and registering `bareship.dev`.

## Alternatives considered

- Keep `rn-template` — can't rank for its own name.
- Fullkeel — free on npm and as domains, but the GitHub username is taken.
- Keelson, Ironhull — the `.dev` domains are taken.
- Offlane — a common Dota 2 term, so results would be swamped.
- Bareframe — an npm package with that name already exists (web components, 2026).
- Outpost, Shipshape, Seaworthy, Bedrock — crowded names, or they clash with existing products.
- Placeholder `Bareship` (equal to the brand) — `init` would rewrite the brand in every new app.
