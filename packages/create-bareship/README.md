# create-bareship

The installer for [Bareship](../../README.md): `npx create-bareship Acme` creates an app from the template
in one command ([ADR 0018](../../docs/decisions/0018-create-bareship.md)).

Its npm page shows the repository's [README](../../README.md), which `pnpm pack-template` copies into the
package, so the options and screenshots live there. The code is one file with no dependencies:
[`bin/create-bareship.mjs`](bin/create-bareship.mjs). Check changes with `scripts/ci/check-create.sh`
([packaging](../../docs/packaging.md)).
