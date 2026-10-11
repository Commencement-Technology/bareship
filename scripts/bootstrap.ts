/**
 * Renames a fresh copy of the template: app name, display name and bundle id, on both platforms.
 *
 *   pnpm bootstrap --name Acme --bundle-id com.acme.app [--display-name "Acme Shop"] [--skip-pods]
 *
 * --name          PascalCase identifier used for the Xcode project/target, schemes and the JS module.
 * --bundle-id     Reverse-DNS id. Android applicationId/namespace and iOS bundle id.
 *                 dev and staging builds append .dev / .staging.
 * --display-name  Name under the icon (default: --name). dev/staging get " Dev" / " Staging".
 *
 * Run it once, on a clean checkout, before writing app code.
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(__dirname, '..');

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    'bundle-id': { type: 'string' },
    'display-name': { type: 'string' },
    'skip-pods': { type: 'boolean', default: false },
  },
});

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const newName = values.name ?? fail('Missing --name (for example --name Acme)');
const newBundleId =
  values['bundle-id'] ?? fail('Missing --bundle-id (for example --bundle-id com.acme.app)');
const newDisplay = values['display-name'] ?? newName;

if (!/^[A-Z][A-Za-z0-9]*$/.test(newName))
  fail('--name must be PascalCase letters and digits, like "AcmeShop".');
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(newBundleId))
  fail('--bundle-id must be lowercase reverse-DNS, like "com.acme.shop".');

const read = (p: string) => readFileSync(join(root, p), 'utf8');
const write = (p: string, s: string) => writeFileSync(join(root, p), s);

const appJson = JSON.parse(read('app.json')) as { name: string; displayName: string };
const oldName = appJson.name;
const oldDisplay = appJson.displayName;
const oldBundleId = read('android/app/build.gradle').match(/applicationId\s+"([^"]+)"/)?.[1];
if (!oldBundleId) fail('Could not find applicationId in android/app/build.gradle.');

if (oldName === newName && oldBundleId === newBundleId && oldDisplay === newDisplay) {
  console.log('Nothing to rename.');
  process.exit(0);
}

const kebab = newName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'Pods',
  'build',
  'vendor',
  '.bundle',
  'coverage',
  'assets',
]);
const TEXT_EXT =
  /\.(kt|java|gradle|kts|xml|properties|pro|swift|m|mm|h|plist|pbxproj|xcscheme|xcconfig|xcprivacy|storyboard|json|ts|tsx|js|mjs|cjs|rb|md|yml|yaml)$|^(Podfile|Gemfile|\.env\..+)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (TEXT_EXT.test(entry)) out.push(full);
  }
  return out;
}

// 1. Display names first (they contain the app name), then bundle id, then the identifier.
const replacements: Array<[RegExp, string]> = [
  [new RegExp(`"${oldDisplay} (Dev|Staging)"`, 'g'), `"${newDisplay} $1"`],
  [
    new RegExp(`resValue "string", "app_name", "${oldDisplay}"`, 'g'),
    `resValue "string", "app_name", "${newDisplay}"`,
  ],
  [new RegExp(oldBundleId.replace(/\./g, '\\.'), 'g'), newBundleId],
  // Deep-link scheme (APP_SCHEME in .env.*, and links in tests): rntemplate-dev:// → acme-shop-dev://.
  [new RegExp(`\\b${oldName.toLowerCase()}(?=-(?:dev|staging)\\b|://|$)`, 'gm'), kebab],
  [new RegExp(`\\b${oldName}\\b`, 'g'), newName],
  [new RegExp(`\\b${oldName}(?=-|\\.|_)`, 'g'), newName],
];

let changed = 0;
for (const file of walk(root)) {
  if (file.endsWith('scripts/bootstrap.ts')) continue;
  const before = readFileSync(file, 'utf8');
  const after = replacements.reduce(
    (text, [pattern, value]) => text.replace(pattern, value),
    before,
  );
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

const pkg = JSON.parse(read('package.json'));
pkg.name = kebab;
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
write(
  'app.json',
  JSON.stringify({ ...appJson, name: newName, displayName: newDisplay }, null, 2) + '\n',
);

// 2. Move the Android package directory.
const javaRoot = 'android/app/src/main/java';
const oldPkgDir = join(root, javaRoot, ...oldBundleId.split('.'));
const newPkgDir = join(root, javaRoot, ...newBundleId.split('.'));
if (oldPkgDir !== newPkgDir && existsSync(oldPkgDir)) {
  mkdirSync(dirname(newPkgDir), { recursive: true });
  renameSync(oldPkgDir, newPkgDir);
  // Remove now-empty parent folders of the old package.
  let parent = dirname(oldPkgDir);
  while (parent !== join(root, javaRoot) && readdirSync(parent).length === 0) {
    rmSync(parent, { recursive: true });
    parent = dirname(parent);
  }
}

// 3. Rename iOS paths that carry the old name.
const iosRenames: Array<[from: string, to: string]> = [
  [`ios/${oldName}`, `ios/${newName}`],
  [`ios/${oldName}.xcodeproj`, `ios/${newName}.xcodeproj`],
  ...['Dev', 'Staging', 'Prod'].map((env): [string, string] => [
    `ios/${newName}.xcodeproj/xcshareddata/xcschemes/${oldName}-${env}.xcscheme`,
    `ios/${newName}.xcodeproj/xcshareddata/xcschemes/${newName}-${env}.xcscheme`,
  ]),
];
for (const [from, to] of iosRenames) {
  if (from !== to && existsSync(join(root, from))) renameSync(join(root, from), join(root, to));
}
for (const stale of [`ios/${oldName}.xcworkspace`, 'ios/Pods', 'ios/Podfile.lock', 'ios/build']) {
  rmSync(join(root, stale), { recursive: true, force: true });
}

// 4. Regenerate iOS environment configs for the new name and id, then pods.
const env = { ...process.env, LANG: 'en_US.UTF-8', BASE_BUNDLE_ID: newBundleId };
execFileSync('bundle', ['exec', 'ruby', 'scripts/ios/configure-environments.rb'], {
  cwd: root,
  stdio: 'inherit',
  env,
});
if (!values['skip-pods']) {
  execFileSync('bundle', ['exec', 'pod', 'install', '--project-directory=ios'], {
    cwd: root,
    stdio: 'inherit',
    env,
  });
}

console.log(`\n✓ Renamed ${oldName} → ${newName} (${newBundleId}), ${changed} files updated.`);
console.log(`  Display names: "${newDisplay}", "${newDisplay} Staging", "${newDisplay} Dev".`);
console.log('  Next: regenerate icons with `pnpm icons` after replacing assets/brand/icon.svg.');
console.log(
  `  Review the changes with git before committing: ${relative(process.cwd(), root) || '.'}`,
);
