/**
 * Builds the npm package for `npx @react-native-community/cli init MyApp --template <package>` (ADR 0001).
 *
 *   pnpm pack-template            dist/npm/ and dist/npm/<name>-<version>.tgz
 *
 * The package holds `template.config.js` and the app in `template/`. The CLI copies `template/`, replaces
 * every "RnTemplate" / "rntemplate" (the Xcode project, schemes, bundle ids, Android package, URL schemes)
 * with the new app's name, and renames `_gitignore` to `.gitignore` (npm drops `.gitignore` files).
 * The files are the ones git tracks or would track (`git ls-files`), so ignored output never ships.
 *
 * Publishing is a separate, manual step: `npm publish dist/npm/<name>-<version>.tgz` (docs/packaging.md).
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'dist', 'npm');
const PLACEHOLDER = 'RnTemplate';

/** About the template itself, not part of an app made from it. */
const NOT_IN_APP = [
  /^scripts\/pack-template\.ts$/,
  /^scripts\/ci\/check-template-init\.sh$/,
  /^docs\/packaging\.md$/,
  /^LICENSE$/,
  /^CHANGELOG\.md$/,
  /^CONTRIBUTING\.md$/,
  /^SECURITY\.md$/,
  /^\.github\/ISSUE_TEMPLATE\//,
  /^website\//, // the template's website, not part of an app
];

type PackageJson = Record<string, unknown> & {
  name: string;
  version: string;
  scripts: Record<string, string>;
};

function files(): string[] {
  const output = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return output
    .split('\0')
    .filter(Boolean)
    .filter(file => existsSync(join(ROOT, file))) // deleted but not yet staged
    .filter(file => !NOT_IN_APP.some(pattern => pattern.test(file)));
}

function main() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as PackageJson;
  rmSync(OUT, { recursive: true, force: true });

  const appFiles = files();
  for (const file of appFiles) {
    // npm leaves out .gitignore files; the CLI renames _gitignore back.
    const target = file.replace(/(^|\/)\.gitignore$/, '$1_gitignore');
    mkdirSync(dirname(join(OUT, 'template', target)), { recursive: true });
    copyFileSync(join(ROOT, file), join(OUT, 'template', target));
  }

  // The app's package.json: named after the app (the CLI lower-cases the placeholder), and the app is
  // the user's own, so it carries no license.
  const scripts = { ...pkg.scripts };
  delete scripts['pack-template'];
  // The website stays in the template's repo, so its scripts don't go to apps.
  delete scripts['site:dev'];
  delete scripts['site:build'];
  const app = {
    ...pkg,
    name: PLACEHOLDER.toLowerCase(),
    version: '0.0.1',
    description: undefined,
    license: undefined,
    scripts,
  };
  writeFileSync(join(OUT, 'template', 'package.json'), JSON.stringify(app, null, 2) + '\n');

  writeFileSync(
    join(OUT, 'template.config.js'),
    `module.exports = {
  placeholderName: '${PLACEHOLDER}',
  titlePlaceholder: '${PLACEHOLDER}',
  templateDir: './template',
};
`,
  );

  const description = String(pkg.description ?? '').replace(/\s*\(Track A\)\.?$/, '.');
  const manifest = {
    name: pkg.name,
    version: pkg.version,
    description,
    license: 'MIT',
    author: 'Praveen Singh',
    repository: { type: 'git', url: 'git+https://github.com/psingh2907/rn-template-bare.git' },
    keywords: ['react-native', 'template', 'react-native-template', 'boilerplate', 'offline-first'],
    files: ['template', 'template.config.js'],
  };
  writeFileSync(join(OUT, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  copyFileSync(join(ROOT, 'README.md'), join(OUT, 'README.md'));
  if (existsSync(join(ROOT, 'LICENSE'))) {
    copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'LICENSE'));
    // The app is the user's to license; the template's MIT notice travels with it under its own name.
    copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'template', 'TEMPLATE-LICENSE'));
  }

  const tarball = execFileSync('npm', ['pack', '--silent'], { cwd: OUT, encoding: 'utf8' }).trim();
  console.log(`Packed ${appFiles.length} app files into dist/npm/${tarball}`);
  console.log(
    `Try it: npx @react-native-community/cli init MyApp --template file:${join(OUT, tarball)} --skip-install`,
  );
}

main();
