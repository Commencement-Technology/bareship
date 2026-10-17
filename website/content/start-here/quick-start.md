---
title: Quick start
description: "Create an app from the template, run it on a simulator or emulator, and start building your own features."
---

By the end of this page you have your own app, with your name and bundle id, running on an emulator or simulator, signed in with
sample data. It takes about 15 minutes plus the first native build, which compiles a lot of native code
and can take 30 minutes or more.

## Before you start

You need:

- **Node** 22.11 or later (`.nvmrc` pins 24)
- **pnpm** 12. Run `corepack enable` and the project's pinned version is used.
- **Ruby** 3.2.2 (`.ruby-version`) with Bundler
- **Java** 21
- **iOS:** a Mac with Xcode 27
- **Android:** Android Studio with SDK 37 and NDK 27.1, and `ANDROID_HOME` set to the SDK
  (usually `~/Library/Android/sdk`)

You don't need a backend, a Firebase project or an Apple Developer account.

## 1. Create your app

Pick one.

**With the React Native CLI (recommended):** it downloads the template from
[npm](https://www.npmjs.com/package/bareship) and names the app.

```bash
npx @react-native-community/cli@20.2.0 init Acme --template bareship --skip-install --install-pods false
cd Acme
```

Use `--skip-install`: the CLI can't install with pnpm, and the project's lockfile and package policy need
pnpm. Don't pass `--package-name`; you set the bundle id in step 3. To use a particular version of the
template, add it to the name: `--template bareship@0.1.0`. The [changelog](/reference/changelog/) lists the
versions.

**From GitHub:** click **Use this template** on the
[repository](https://github.com/psingh2907/bareship), then clone your new repository. Your copy also holds the
template's own files (the website, the changelog, the contributing guide); delete the ones you don't want.

## 2. Install dependencies

```bash
pnpm install
bundle install
```

## 3. Set your bundle id

```bash
pnpm bootstrap --bundle-id com.acme.app --display-name "Acme"
```

This sets the bundle ids and display names and moves the Android package to match, then runs `pod install`.
The dev and staging builds get `.dev` and `.staging` added to the id and to the name, so all three install side
by side. Run it once, before you write code.

`init` already named the app. If you started from GitHub, your copy is still called `BareshipApp`: add
`--name Acme` to rename the Xcode project, schemes and URL schemes too.

## 4. Run it

Start an Android emulator or plug in a phone first. The first debug build compiles native code only for the
connected device; with nothing connected it compiles for every Android CPU type, which takes about four times
longer.

```bash
pnpm android
```

For iOS:

```bash
pnpm ios
```

The app opens to onboarding, then sign-in. Sign in with `demo@example.com` / `password123`.

## 5. Look around

The demo shows the patterns you'll reuse:

- **Feed:** loading placeholders, pages that load as you scroll, pull to refresh, likes that change at once.
- **Offline:** turn on airplane mode. A banner appears, a like is kept as "waiting to sync", and it's sent when
  you reconnect, even after closing the app.
- **Settings:** light, dark or system theme; English or Arabic (right to left); notifications; sign out and
  delete account.
- **Component showroom** (Settings, development builds only): every UI primitive in one place.

## 6. Start your own app

When you're ready to build your own screens, remove the demo and add a feature:

```bash
pnpm strip-examples
pnpm gen feature orders
```

`strip-examples` removes the feed, its sample data and the showroom, and leaves a blank Home tab; sign-in,
onboarding and settings stay. `pnpm gen` writes a working list screen with its API call, sample data, strings
and tests ([Generators](/build/generators/)).

Run the checks whenever you change something:

```bash
pnpm check
```

## Next

- [Environments](/start-here/environments/): dev, staging and prod, and where configuration lives.
- [Offline](/build/offline/): choose what each write does without a connection.
- [Going live](/production/going-live/): your API, signing, Firebase and push.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| `npm error 404 … bareship` from `init` | Check the spelling: `--template bareship`. Behind a company registry or proxy, the package may not be mirrored yet; ask for `bareship` to be added |
| `Seems like the package manager you want to use is not installed` from `init` | Don't pass `--pm pnpm`; the CLI only installs with npm, yarn or bun. Use `--skip-install`, then `pnpm install` |
| `Run bundle install first` from `bootstrap` | Run `bundle install`, then `bootstrap` again. Nothing was renamed |
| `Unable to load contents of file list: '/Target Support Files/Pods-…'` from `pnpm ios` | The pods aren't installed. Run `pnpm pods`, then `pnpm ios` again |
| `SDK location not found` from Gradle | Set `ANDROID_HOME` to your Android SDK, for example `export ANDROID_HOME=~/Library/Android/sdk` |
| `Invalid Podfile file … on US-ASCII` from CocoaPods | Your terminal isn't using UTF-8. Run `export LANG=en_US.UTF-8`, then `pnpm pods` |
| `NoSuchFileException … .gradle/caches/…/transforms/…` | Gradle's cache has a half-written entry. Run `cd android && ./gradlew --stop`, delete the folder named in the error, and build again |
| The first Android build runs for an hour | No device was connected, so it builds for every CPU type. Stop it, start the emulator, and run `pnpm android` again |
