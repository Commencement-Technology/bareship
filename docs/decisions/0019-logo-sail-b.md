# 0019. The logo is a boat whose mainsail is a B

- Status: Accepted
- Date: 2026-10-19

## Context

The first logo, three stacked layers (app, features, shared), was a placeholder. It looked like many
stack, layer and database logos, and nothing in it said bare, ship or offline. With `create-bareship` on
npm, the logo is now seen first on the npm page, the README, the GitHub avatar and a 16 px browser tab, so it
needs to be recognisable at small sizes and specific to Bareship.

Logo principles used: simple, distinctive and appropriate at once; memorable enough to sketch; legible at
16 px; works in one colour and on light and dark. Ten concepts were drawn and compared at every size
(`assets/brand/concepts/`, with the research in its `index.html`).

## Decision

- **The mark is a sailboat: a jib, a mainsail shaped as a B, and a hull** (concept G, "Sail B"). From a
  distance it is a boat (ship); up close the mainsail spells the name. The jib and the B are two sails on
  one hull, like iOS and Android on one codebase.
- **Colours stay the app's primary blue:** `#0A6C96` in light mode, `#55B6E0` in dark mode. No theme
  changes.
- **Files:** `assets/brand/logo.svg` (splash), `assets/brand/icon.svg` (app icon, white on blue),
  `website/src/assets/logo-light.svg` and `logo-dark.svg`, `website/public/favicon.svg` and the share image
  (`website/scripts/og-image.mjs`). The mark is drawn on a 64 × 64 grid; the same three paths are used in
  every file.
- The concepts folder stays in the repository as the record of this decision and is left out of apps made
  from the template.

## Consequences

- Apps made from the template start with this icon and splash as their placeholder; `pnpm icons` and
  `pnpm splash` replace them as before.
- The GitHub repository's social preview and any avatars are set by hand outside the repository.

## Alternatives considered

- Hull B (a monogram B with a hull bowl), Prompt sail (`>_` as a boat), Twin sails, Cargo, Message in a
  bottle, Hull folder, and combinations of the first three (Prompt B, Prompt boat, Keel B). Prompt B said
  the most but was too busy at 16 px; the plain monogram and plain sailboat each said only half.
- Keep the stacked layers: generic, and it says nothing about Bareship.
