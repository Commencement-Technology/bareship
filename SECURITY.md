# Security

## Reporting a vulnerability

Please don't open a public issue. Report it privately through GitHub: the repository's **Security** tab →
**Report a vulnerability**. Include what's affected, how to reproduce it, and the impact you see.

Once a fix is ready, it's released and the advisory is published, with credit to you if you want it.

## Scope

The template's own code and configuration: the app layer in `src/`, the native changes, the scripts, the
supply-chain policy in `pnpm-workspace.yaml` and the CI workflow. Vulnerabilities in a dependency belong
with that project; tell us too if the template's use of it makes things worse.

## Supported versions

Only the latest release. Apps made from the template own their copy of the code, so a fix reaches them
only when they apply it; advisories say which files to change.
