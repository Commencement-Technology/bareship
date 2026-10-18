# create-bareship

Creates a React Native app from [Bareship](https://bareship.praveensingh.co.in), an offline-first, bare
React Native template for teams and AI agents.

```bash
npx create-bareship Acme
```

It checks your tools, asks for the bundle id and display name, then creates the app, installs its
dependencies and sets the bundle id. When it's done:

```bash
cd Acme
pnpm ios        # or: pnpm android
```

Sign in with `demo@example.com` / `password123`.

## Before you start

You need Node 22.11 or later, pnpm (`corepack enable`), Ruby with Bundler, and Java 21. For iOS, a Mac
with Xcode. The command checks these first and tells you how to fix anything missing.

## Options

| Option | What it does |
| --- | --- |
| `--bundle-id <id>` | Reverse-domain bundle id, like `com.acme.app`. Default: `com.<appname>.app` |
| `--display-name <name>` | Name under the app icon. Default: the app name |
| `-y`, `--yes` | Ask nothing and use the defaults, for CI and AI agents |
| `--skip-pods` | Don't run `pod install`. Always on outside macOS |
| `--skip-checks` | Don't check the tools first |
| `--dry-run` | Check, then print the commands without running them |

For example, with no questions:

```bash
npx create-bareship Acme --bundle-id com.acme.app --display-name "Acme" --yes
```

`create-bareship@X` creates the app from `bareship@X`. To create it the manual way, see the
[quick start](https://github.com/psingh2907/bareship#quick-start).

## License

MIT
