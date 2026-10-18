# 0018. A one-command installer: `create-bareship`

- Status: Accepted
- Date: 2026-10-18
- Refines: how people create an app in [0001](0001-scope-and-two-tracks.md)

## Context

Creating an app takes five steps: the React Native CLI's `init` with `--skip-install` (it can't install
with pnpm), `pnpm install`, `bundle install`, `pnpm bootstrap --bundle-id …`, and only then a run. Each
step has a flag that is easy to get wrong (`--package-name` breaks the iOS bundle id suffixes,
[packaging](../packaging.md)), and nothing checks the tools first, so a missing Ruby or Java shows up
half-way through as someone else's error.

People who find the package on npm also try `npm install bareship`, which installs a template folder and
nothing they can run: the package has no `main` or `bin`.

## Decision

- **`create-bareship`** is a separate npm package, so `npx create-bareship Acme` (and
  `npm create bareship`) creates an app in one command. It checks the tools first (Node, pnpm through
  Corepack, Ruby and Bundler, Java 21, and on macOS Xcode and CocoaPods), asks for the app name, bundle id
  and display name (each also a flag; `--yes` asks nothing, for CI and AI agents), then runs the same
  steps as the manual quick start: `init` with the CLI pinned to the version the template is tested with,
  `pnpm install`, `bundle install` and `pnpm bootstrap`.
- **It lives in this repository**, in `packages/create-bareship/`, as a standalone package. It is not a
  pnpm workspace member: the root `package.json` is the app's, and the template's lockfile and policy
  shouldn't change because of the installer.
- **No runtime dependencies.** Node built-ins only (`util.parseArgs`, `readline/promises`,
  `child_process`), so `npx create-bareship` downloads one small package and nothing transitive. This
  keeps to the supply-chain policy of [0003](0003-package-manager-and-supply-chain.md): the installer is
  the one package that runs before that policy is in place.
- **Versions move in lockstep.** `create-bareship@X` always creates the app from `bareship@X`, the same
  version as the root `package.json`. The two packages are packed, checked and published together.
- **`bareship` exposes the same script as a `bin`**, so `npx bareship Acme` works too, and someone who
  reaches for the package name still gets an app. The npm README says at the top that the package is a
  template, not a library.

## Consequences

- One more package to publish with every release, and its version has to match. `scripts/ci/check-create.sh`
  creates an app through both packages and runs the same assertions as `check-template-init.sh`.
- The packer must leave `packages/` out of `template/`, or every app would carry the installer.
- The installer pins the React Native CLI version; upgrading React Native means updating it there too.
- The manual steps stay documented as a fallback, and for copies of the GitHub repository.

## Alternatives considered

- A pnpm workspace with `packages/*`: turns the root into a workspace root, changes the app's lockfile and
  ships workspace config into every app.
- A CLI framework (commander, prompts, ora): nicer prompts, but every dependency is code that runs on the
  user's machine before any policy applies.
- A separate repository: the installer and template would drift; the version lock is easier in one place.
- Only the `bareship` bin: `npx create-bareship` and `npm create bareship` are the names people expect.
