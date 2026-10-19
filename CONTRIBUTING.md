# Contributing

Thanks for helping. This file covers contributing to the template itself; [AGENTS.md](AGENTS.md) holds the
rules for code written in it, and applies here too. Everyone taking part follows the
[code of conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bugs:** open an issue with the steps to reproduce, the platform and the versions (`npx react-native info`).
- **Changes to a decision** (a library, a pattern, a convention): open an issue first. Decisions are recorded
  in [docs/decisions/](docs/decisions/README.md); a change gets a new ADR rather than an edit to the old one.
- **Security issues:** don't open an issue; see [SECURITY.md](SECURITY.md).

## Making a change

```bash
pnpm install
bundle install
pnpm check            # types, lint, format, boundaries, tests
```

- Use Conventional Commits (`feat:`, `fix:`, `docs:`…); commitlint checks them on commit.
- Mark demo-only code with `// @example` (AGENTS.md › Demo code) and run
  `scripts/ci/check-strip-examples.sh`, so `pnpm strip-examples` keeps working.
- Changed something the generators produce (a convention, a primitive, the folder layout)? Update
  `scripts/generate.ts` and the `add-*` skills in `.claude/skills/` to match.
- Native change: mark it `[bareship]` and add a row to [docs/native-changes.md](docs/native-changes.md).
- New dependency: check it against [docs/version-matrix.md](docs/version-matrix.md) and record it there.
- Touched packaging (`template.config`, dotfiles, the name placeholder)? Run
  `scripts/ci/check-template-init.sh` ([docs/packaging.md](docs/packaging.md)).
- Touched the installer (`packages/create-bareship/`, [ADR 0018](docs/decisions/0018-create-bareship.md))?
  Keep it free of dependencies and run `scripts/ci/check-create.sh`, which creates apps through both npm
  packages. Its version always matches the root `package.json`.
- Releasing a new version to npm: maintainers follow [docs/packaging.md › Publish](docs/packaging.md#publish).

Fill in the pull request template: what changed, and how you tested it (which platforms, which devices).

## Editing the website

The website (`website/`, Astro Starlight) is built from the repo's own docs, so most pages are edited where
they already live:

| Page | Edit |
| --- | --- |
| Environments, Architecture, Generators, Going live, Releasing, Demo build, Native changes, Version matrix, Best-practices audit | The file in `docs/` |
| Decisions | `docs/decisions/` |
| Styling, Testing, Project rules | The matching section of `AGENTS.md` |
| Contributing, Changelog | `CONTRIBUTING.md`, `CHANGELOG.md` |
| Home, Introduction, Quick start, FAQ, Offline, Built for AI agents | `website/content/` |

Every page's **Edit page** link opens the right file. `website/src/content/docs/` is generated: changes there
are overwritten.

```bash
pnpm site:dev       # http://localhost:4321, updates as you edit docs/, AGENTS.md or website/content/
pnpm site:build     # the site in website/dist/, then the link check
```

- **Add a page from `docs/`:** add it to `PAGES` in `website/scripts/sync-docs.mjs` and to the sidebar in
  `website/astro.config.mjs`. A page written only for the site goes in `website/content/` and the sidebar.
- **Links:** link between docs with relative paths (`going-live.md#use-your-api`) as usual; the site rewrites
  them. `pnpm site:build` fails and names the link when one points to a missing page or heading, so run it
  after renaming a file or rewording a heading.
- **Frontmatter:** quote a `description` that contains a colon, or the build fails.
- If `pnpm site:dev` keeps showing an error you've fixed, restart it with `pnpm site:dev --force`.

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).
