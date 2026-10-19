# Logo concepts

**Chosen: G, Sail B** ([ADR 0019](../../../docs/decisions/0019-logo-sail-b.md)), with the B drawn as one solid
shape. It is now in `assets/brand/logo.svg`, `icon.svg` and the website. The other files here are the record
of the choice and are not shipped in apps made from the template.

Ten candidates to replace the stacked-layers mark: six first ideas (A to F) and four combinations of A, B and E (G to J), and six refinements of the chosen G (G1 to G6, files `g1-*` to `g6-*`). Open `index.html` in a browser to compare them: each is
shown large, at 32 and 16 px, on light and dark, as an app icon and next to the wordmark. The page also holds
the research behind them (logo principles, how other developer tools do it, what Bareship's logo should say).

| Concept | Says | Idea |
| --- | --- | --- |
| A. Hull B | Bareship, ship | A B whose lower bowl is a hull, a porthole as its counter |
| B. Prompt sail | `npx create-bareship`, ship | A `>_` prompt: the chevron is a sail, the underscore a hull |
| C. Cargo | ship, offline queue, layers | Three containers on a hull: queued writes waiting to ship |
| D. Message in a bottle | offline-first | A message written offline that still arrives later |
| E. Twin sails | bare, iOS + Android | Two sails on one hull, both native projects yours |
| F. Hull folder | bare: you own `ios/` and `android/` | A folder whose lower half is a hull |
| G. Sail B (A + E) | Bareship, two sails, ship | A boat whose mainsail is a B, with a jib |
| H. Prompt B (A + B + E) | `npx create-bareship`, Bareship, ship | `>B` on a hull: prompt, B sail and boat |
| I. Prompt boat (B + E) | one command, two sails, ship | A boat whose front sail is a `>` prompt |
| J. Keel B (A, simplified) | Bareship, ship | A bold B standing on a hull |
| G1. Open counters | | G with the B's holes cut out |
| G2. Curved hull | | G with a rounded hull |
| G3. One piece | | G with the mast joined to the hull |
| G4. Porthole | | G with A's porthole in the hull |
| G5. On a wave | | G with a wave under the hull |
| G6. Refined | | G1 + G2 + G3 together |

Each concept has four files: `NN-name.svg` (brand blue), `-mono.svg` (black, the one-colour test),
`-icon.svg` (1024 × 1024 app icon, square corners) and `-favicon.svg` (switches to the dark-mode blue with
`prefers-color-scheme`). All use the app's primary colours, `#0A6C96` and `#55B6E0`.

After one is chosen it replaces `assets/brand/logo.svg`, `assets/brand/icon.svg`, `website/src/assets/logo-*.svg`
and `website/public/favicon.svg`; then `pnpm icons` and `pnpm splash` regenerate the native assets
([docs/app-icon-and-splash.md](../../../docs/app-icon-and-splash.md)).
