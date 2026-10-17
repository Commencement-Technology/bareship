# App icon and splash screen

The app icon and the splash screen are generated from two files in `assets/brand/`. Replace them with your
own, run two commands, and rebuild: every environment on iOS and Android gets your icon, and the app opens on
your logo.

| File | Used for | Command |
| --- | --- | --- |
| `assets/brand/icon.svg` or `icon.png` | App icon on the home screen | `pnpm icons` |
| `assets/brand/logo.svg` | Logo in the middle of the splash screen | `pnpm splash` |

Both are native assets. Reloading the JavaScript doesn't show them; you need a new native build.

## Change the app icon

1. Put your icon in `assets/brand/`, as `icon.svg` or as a 1024 × 1024 `icon.png`. When both exist, the PNG
   is used.
2. Run:

   ```bash
   pnpm icons
   ```

3. Rebuild: `pnpm ios` and `pnpm android`.

Give the icon square corners and no transparency. iOS and Android round the corners themselves, and
transparent areas turn white.

Each environment gets its own icon, so you can tell the builds apart on one phone:

| Environment | Icon |
| --- | --- |
| prod | Your icon as it is |
| staging | Your icon with an orange **STG** ribbon in the corner |
| dev | Your icon with a red **DEV** ribbon in the corner |

To change a ribbon's text or color, edit `ENVIRONMENTS` at the top of `scripts/icons.ts` and run
`pnpm icons` again.

## Change the splash screen

The splash screen is your logo, centred on a plain background. It shows from the moment the app starts until
the user's session and cached data are loaded, then fades out, so the first screen the user sees is already
filled in.

1. Replace `assets/brand/logo.svg` with your logo.
2. Run:

   ```bash
   pnpm splash
   ```

3. Rebuild: `pnpm ios` and `pnpm android`.

To change the background color or the logo's size, edit the `splash` script in `package.json`:
`--background=FFFFFF` is the color as hex without `#`, and `--logo-width=120` is the logo's width in points.
Then run `pnpm splash` again.

The splash screen is the same in every environment and in light and dark mode.

## Commit the generated files

Both commands write images into `android/` and `ios/`, and `pnpm splash` also writes `assets/bootsplash/`.
Commit them with your new source files: builds use the generated images, not `assets/brand/`.

## If something goes wrong

| What you see | What to do |
| --- | --- |
| The old icon or splash screen after rebuilding | Delete the app from the simulator or phone and install it again. iOS keeps the old launch screen until the app is removed |
| `Input file is missing` or `unsupported image format` from `pnpm icons` | Check that `assets/brand/icon.svg` or `icon.png` exists and is a valid image |
| A white square behind the icon | The icon has transparent areas. Fill the background in your source file |
| Blurry icon | Use an SVG, or a PNG of at least 1024 × 1024 |
| The logo is cut off on Android 12 or later | Android 12 shows the splash logo inside a circle. Lower `--logo-width` or add space around the logo |
| An icon is missing in one environment on Android | Run `pnpm icons` again; it writes every environment's icons |

Android gets square and round launcher icons, not adaptive ones, so launchers that animate or reshape icons
show it as it is.
