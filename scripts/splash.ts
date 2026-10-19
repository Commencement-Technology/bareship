/**
 * Runs `react-native-bootsplash generate` with the arguments it is given, then puts AndroidManifest.xml back.
 *
 *   pnpm splash
 *
 * - The generator reformats the manifest only to set `android:theme="@style/BootTheme"` on .MainActivity, and
 *   that reformat deletes every XML comment, including the `[bareship]` markers (see docs/native-changes.md).
 *   It has no option to skip the manifest.
 * - When the manifest already sets BootTheme, the generator changes nothing else in it, so the original file is
 *   restored byte for byte. Otherwise the generated manifest is kept and a warning names the lost markers.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const manifestPath = join(root, 'android/app/src/main/AndroidManifest.xml');
const cli = join(root, 'node_modules/react-native-bootsplash/cli.js');

const original = readFileSync(manifestPath, 'utf8');

execFileSync(process.execPath, [cli, ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });

if (original.includes('android:theme="@style/BootTheme"')) {
  writeFileSync(manifestPath, original);
} else {
  const generated = readFileSync(manifestPath, 'utf8');
  const lost = (original.match(/<!--[\s\S]*?-->/g) ?? []).filter(
    comment => !generated.includes(comment),
  );
  if (lost.length > 0) {
    console.warn(
      `\nreact-native-bootsplash removed these comments from AndroidManifest.xml. Put them back by hand:\n${lost
        .map(comment => `  ${comment}`)
        .join('\n')}`,
    );
  }
}
