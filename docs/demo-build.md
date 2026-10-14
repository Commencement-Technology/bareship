# Demo build (Android)

`pnpm build:android:demo` makes a release build that runs on its own, with sample data built in, so you
can try sign-in, the feed, likes and offline mode on a phone before you have a backend.

Before you start:

- The build is for 64-bit ARM phones (almost every Android phone from the last few years).
- It's signed with the debug key unless you set up [release signing](going-live.md#sign-release-builds), so
  it can't go to Play.
- It installs as the dev app ("BareshipApp Dev"), next to any staging or prod build.

1. Build it. The first build takes a while because the native code compiles in release mode:

   ```bash
   pnpm build:android:demo
   ```

2. Install `android/app/build/outputs/apk/dev/release/app-dev-release.apk`. With the phone connected over
   USB, run the command below. Or copy the file to the phone and open it, and allow installs from that app
   when Android asks.

   ```bash
   adb install -r android/app/build/outputs/apk/dev/release/app-dev-release.apk
   ```

3. Sign in with `demo@example.com` / `password123`.

The sample data resets every time the app starts; your sign-in and settings stay.

## How it stays out of real releases

The demo build bundles `index.demo.js`, which starts the mock backend and hands it to the app through
`src/app/mock-backend.ts`. Normal release bundles never include it:

- Gradle refuses `-PdemoBuild` for the staging and prod environments.
- `scripts/ci/check-no-mocks-in-release.sh` fails CI if mock code reaches a normal release bundle.

## If something goes wrong

- **"App not installed" or a signature error:** a dev build signed with a different key is already on the
  phone. Uninstall it, then install again.
- **The build stops with "-PdemoBuild only builds the dev flavor":** the demo build only exists for the dev
  environment. Use `pnpm build:android:staging` or `pnpm build:android:prod` for those.
