# 0003. pnpm and supply-chain policy

- Status: Accepted
- Date: 2026-10-10
- Questions: B3, F10

## Context

npm supply-chain attacks usually arrive through brand-new versions and install scripts. pnpm (11+) can refuse both by policy.

## Decision

- **pnpm (B3)** with `nodeLinker: hoisted` in `pnpm-workspace.yaml`. A flat `node_modules` avoids Metro, CocoaPods and Gradle autolinking resolution problems.
- **`minimumReleaseAge: 4320`** (3 days). New versions are not installed until they are three days old; exceptions go in `minimumReleaseAgeExclude` with a reason.
- **Build scripts are denied by default.** Only packages listed `true` under `allowBuilds` may run install scripts. Today none need to. Explicitly denied: `@firebase/util`, `protobufjs` (scripts unused by React Native), `esbuild` and `unrs-resolver` (their native binaries arrive as optional dependencies).
- **`trustPolicy: no-downgrade`** and the default `blockExoticSubdeps: true`. Versions older than 30 days are exempt (`trustPolicyIgnoreAfter`), because the check targets fresh takeovers and old releases often predate provenance. Reviewed exceptions go in `trustPolicyExclude` with a reason and date (today: `@expo/*`, the same Expo maintainer publishing every release without provenance).
- **Renovate (F10)**, weekly, with React Native packages grouped together and automerge only for dev tooling. Renovate's own `minimumReleaseAge` matches pnpm's.
- CI installs with `--frozen-lockfile`.

## Consequences

- An urgent security fix younger than three days needs an explicit, reviewed exclude entry.
- Contributors need pnpm. `packageManager` in `package.json` pins the version through Corepack.

## Alternatives considered

- Yarn 4, Bun, npm: none has an equivalent built-in release-age and build-script policy.
