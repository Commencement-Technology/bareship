# Packaging the template

How this repository becomes the two things people start from (ADR 0001): a GitHub template repository and
an npm template for the React Native CLI. This page is for maintainers; it isn't copied into apps.

## The npm template

```bash
pnpm pack-template
```

It writes `dist/npm/` and a tarball, `dist/npm/bareship-<version>.tgz`, which contains:

| Path | What |
| --- | --- |
| `template.config.js` | Tells the CLI the placeholder (`BareshipApp`) and where the app is |
| `template/` | The app: every file git tracks, except the template's own files (this page, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue templates, the website, the packing scripts) |
| `template/README.md` | The app's README, from `scripts/app-readme.md`: how to run, customise and release the app. The template's README stays in this repository |
| `package.json`, `README.md`, `LICENSE` | The npm package itself |

When someone runs `init`, the CLI copies `template/`, replaces every `BareshipApp` and `bareshipapp` (Xcode
project and schemes, bundle ids, the Android package, URL schemes, `package.json`'s name) with the new
app's name, and renames `_gitignore` to `.gitignore`. npm drops `.gitignore` files from packages, so the
packer ships it as `_gitignore`. The app's `package.json` gets version `0.0.1` and no license: the app
belongs to its author. The template's MIT notice ships as `TEMPLATE-LICENSE`, which the license asks for
in copies of the code.

### Check it

```bash
scripts/ci/check-template-init.sh
```

Packs, runs `init`, checks that no placeholder is left, the iOS bundle id kept its environment suffix and the app's README and docs have no broken links,
then installs, runs `pnpm bootstrap` and `pnpm strip-examples`, and runs `pnpm check` in the new app. It
takes a few minutes and builds nothing native.

### Init with `--skip-install`, then pnpm

React Native CLI 20's `init` can't use pnpm (`--pm` takes npm, yarn or bun), and an npm or yarn install
would skip the lockfile and the supply-chain policy in `pnpm-workspace.yaml`. So the instructions are
`init … --skip-install`, then `pnpm install` in the new app.

### Don't recommend `--package-name`

The CLI's `--package-name` overwrites every `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project, which drops
the `$(BUNDLE_ID_SUFFIX)` that keeps dev, staging and prod apart on iOS, and it turns the URL schemes into
`com.acme.shop-dev`. Init with a name only, then set the bundle id with `pnpm bootstrap --bundle-id`.

### Publish

The package is [`bareship` on npm](https://www.npmjs.com/package/bareship)
([ADR 0015](decisions/0015-name-bareship.md)). To publish a new version:

1. `npm login` with the maintainer account.
2. Set `version` in `package.json` and move the `CHANGELOG.md` entries from Unreleased to that version.
3. `pnpm pack-template`, then `scripts/ci/check-template-init.sh`.
4. `npm publish dist/npm/<name>-<version>.tgz --access public`. It asks for the account's 2FA code.
5. Tag the commit `v<version>`, push the tag and create a GitHub release with the changelog entry.
   Publishing the release redeploys the maintainer's portfolio, so its Bareship page shows the new
   version (`.github/workflows/portfolio.yml`, which needs the `PORTFOLIO_DEPLOY_HOOK` secret).

Private vulnerability reporting is on (Settings → Security), so the link in `SECURITY.md` works.

## The GitHub template repository

In the repository's Settings → General, tick **Template repository** (or
`gh repo edit psingh2907/bareship --template`). People then click **Use this template**, clone their
copy and run the quick start in the README (`pnpm install`, `bundle install`, `pnpm bootstrap`). The
repository has to be public for anyone outside it to use the template.

## Demo content

`pnpm strip-examples` removes the demo; `scripts/ci/check-strip-examples.sh` checks that the stripped app
still passes everything. See AGENTS.md › Demo code for the `// @example` markers.
