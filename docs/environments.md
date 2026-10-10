# Environments

Three environments, each with its own app id, name, icon and `.env` file. They install side by side.

| Environment | Android variant | iOS scheme / configuration | App id | `.env` |
| --- | --- | --- | --- | --- |
| dev | `devDebug`, `devRelease` | `<App>-Dev` / `Debug-Dev`, `Release-Dev` | `<id>.dev` | `.env.dev` |
| staging | `stagingDebug`, `stagingRelease` | `<App>-Staging` / `Debug-Staging`, `Release-Staging` | `<id>.staging` | `.env.staging` |
| prod | `prodDebug`, `prodRelease` | `<App>-Prod` / `Debug-Prod`, `Release-Prod` | `<id>` | `.env.prod` |

## Running

```bash
pnpm android            # dev
pnpm android:staging
pnpm ios                # dev
pnpm ios:prod
```

## Configuration values

`src/shared/config/env.ts` is the only file that reads configuration. It validates every key with Zod, so a
missing or malformed value stops the app at launch with the key's name. To add a key:

1. Add it to `.env.example` and each `.env.<environment>`.
2. Add it to `EnvSchema` in `src/shared/config/env.ts`.
3. Use it through `env.MY_KEY`.

Everything in `.env.*` ships inside the app and can be read by anyone who has it. Never put secrets there.

## Adding an environment

1. Android: add a flavor in `android/app/build.gradle` (`productFlavors` and `envConfigFiles`) and its
   variants to `debuggableVariants`.
2. iOS: add it to `ENVIRONMENTS` in `scripts/ios/configure-environments.rb`, run
   `bundle exec ruby scripts/ios/configure-environments.rb`, then add its configurations to `project` and
   `ENVFILES` in `ios/Podfile` and run `pnpm pods`.
3. Add `.env.<name>`, an icon badge in `scripts/icons.ts`, and scripts in `package.json`.
4. Allow the new value in `EnvSchema.APP_ENV`.
