/**
 * Generates app icons for every environment from assets/brand/icon.svg (or icon.png, 1024×1024).
 *
 *   pnpm icons
 *
 * - prod uses the plain icon; dev and staging get a corner badge so testers can tell them apart.
 * - Android: legacy + round launcher icons in android/app/src/<flavor>/res/mipmap-*.
 * - iOS: one 1024 px single-size app icon set per environment (AppIcon, AppIcon-Dev, AppIcon-Staging),
 *   selected per build configuration through ASSETCATALOG_COMPILER_APPICON_NAME in ios/Config/*.xcconfig.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import sharp from 'sharp';

const root = resolve(__dirname, '..');
const appName = (JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')) as { name: string }).name;
const sourceSvg = join(root, 'assets/brand/icon.svg');
const sourcePng = join(root, 'assets/brand/icon.png');
const source = existsSync(sourcePng) ? sourcePng : sourceSvg;

const ENVIRONMENTS = [
  { flavor: 'prod', iosSet: 'AppIcon', badge: null },
  { flavor: 'staging', iosSet: 'AppIcon-Staging', badge: { text: 'STG', color: '#9A5A00' } },
  { flavor: 'dev', iosSet: 'AppIcon-Dev', badge: { text: 'DEV', color: '#A8352A' } },
] as const;

const ANDROID_SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 } as const;

function badgeSvg(text: string, color: string): Buffer {
  // A ribbon across the bottom-right corner, readable at 48 px.
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    <g transform="rotate(-45 768 768)">
      <rect x="368" y="700" width="800" height="150" fill="${color}"/>
      <text x="768" y="812" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="112"
        fill="#FFFFFF" text-anchor="middle" letter-spacing="8">${text}</text>
    </g></svg>`);
}

async function master(badge: (typeof ENVIRONMENTS)[number]['badge']): Promise<Buffer> {
  const base = sharp(source, { density: 300 })
    .resize(1024, 1024)
    .flatten({ background: '#FFFFFF' });
  if (!badge) return base.png().toBuffer();
  return base
    .composite([{ input: badgeSvg(badge.text, badge.color) }])
    .png()
    .toBuffer();
}

function roundMask(size: number): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
  );
}

async function main() {
  for (const env of ENVIRONMENTS) {
    const image = await master(env.badge);

    for (const [density, size] of Object.entries(ANDROID_SIZES)) {
      const dir = join(root, `android/app/src/${env.flavor}/res/mipmap-${density}`);
      mkdirSync(dir, { recursive: true });
      await sharp(image).resize(size, size).png().toFile(join(dir, 'ic_launcher.png'));
      await sharp(image)
        .resize(size, size)
        .composite([{ input: roundMask(size), blend: 'dest-in' }])
        .png()
        .toFile(join(dir, 'ic_launcher_round.png'));
    }

    const setDir = join(root, `ios/${appName}/Images.xcassets/${env.iosSet}.appiconset`);
    mkdirSync(setDir, { recursive: true });
    await sharp(image).resize(1024, 1024).removeAlpha().png().toFile(join(setDir, 'icon-1024.png'));
    writeFileSync(
      join(setDir, 'Contents.json'),
      JSON.stringify(
        {
          images: [
            { filename: 'icon-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' },
          ],
          info: { author: 'xcode', version: 1 },
        },
        null,
        2,
      ) + '\n',
    );
    console.log(`✓ ${env.flavor}: Android mipmaps + iOS ${env.iosSet}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
