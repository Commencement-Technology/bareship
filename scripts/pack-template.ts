/**
 * Builds the npm package for `npx @react-native-community/cli init MyApp --template <package>` (ADR 0001).
 *
 *   pnpm pack-template            dist/npm/<name>-<version>.tgz and dist/npm/create-bareship-<version>.tgz
 *
 * The package holds `template.config.js` and the app in `template/`. The CLI copies `template/`, replaces
 * every "BareshipApp" / "bareshipapp" (the Xcode project, schemes, bundle ids, Android package, URL schemes)
 * with the new app's name, and renames `_gitignore` to `.gitignore` (npm drops `.gitignore` files).
 * The files are the ones git tracks or would track (`git ls-files`), so ignored output never ships.
 *
 * It also packs the installer, `packages/create-bareship` (ADR 0018). Both packages have the same version,
 * and the template package ships the installer as its `bin`, so `npx <name> Acme` works too.
 *
 * Publishing is a separate, manual step: `npm publish` both tarballs (docs/packaging.md).
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'dist', 'npm');
const CLI = join(ROOT, 'packages', 'create-bareship');
const CLI_OUT = join(ROOT, 'dist', 'create-bareship');
const CLI_BIN = join('bin', 'create-bareship.mjs');
const PLACEHOLDER = 'BareshipApp';

/** About the template itself, not part of an app made from it. */
const NOT_IN_APP = [
  /^scripts\/pack-template\.ts$/,
  /^scripts\/ci\/check-template-init\.sh$/,
  /^scripts\/ci\/check-create\.sh$/,
  /^packages\//, // the installer (create-bareship), its own npm package
  /^scripts\/app-readme\.md$/, // becomes the app's README.md
  /^docs\/packaging\.md$/,
  /^LICENSE$/,
  /^CHANGELOG\.md$/,
  /^CONTRIBUTING\.md$/,
  /^SECURITY\.md$/,
  /^CODE_OF_CONDUCT\.md$/,
  /^\.github\/ISSUE_TEMPLATE\//,
  /^\.github\/workflows\/portfolio\.yml$/, // redeploys the maintainer's portfolio
  /^website\//, // the template's website, not part of an app
  /^assets\/screenshots\//, // the README's screenshots
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
  const cli = JSON.parse(readFileSync(join(CLI, 'package.json'), 'utf8')) as PackageJson;
  // create-bareship@X creates apps from bareship@X (ADR 0018).
  if (cli.version !== pkg.version) {
    console.error(
      `✗ packages/create-bareship/package.json is ${cli.version}, package.json is ${pkg.version}. Set both to the same version.`,
    );
    process.exit(1);
  }
  rmSync(OUT, { recursive: true, force: true });
  rmSync(CLI_OUT, { recursive: true, force: true });

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
  // The template's README describes the template (roadmap, contributing, its own license); the app gets
  // its own, which the CLI renames like every other file.
  copyFileSync(join(ROOT, 'scripts', 'app-readme.md'), join(OUT, 'template', 'README.md'));

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
    repository: { type: 'git', url: 'git+https://github.com/psingh2907/bareship.git' },
    keywords: [
      'react-native',
      'react-native-template',
      'template',
      'boilerplate',
      'starter-kit',
      'offline-first',
      'bare-workflow',
      'typescript',
      'production-ready',
      'ai-agents',
    ],
    homepage: 'https://bareship.praveensingh.co.in',
    // The installer, so `npx bareship Acme` creates an app (it reads this package's version).
    bin: { [pkg.name]: CLI_BIN },
    engines: { node: '>= 22.11.0' },
    files: ['template', 'template.config.js', 'bin'],
  };
  writeFileSync(join(OUT, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  mkdirSync(join(OUT, 'bin'), { recursive: true });
  copyFileSync(join(CLI, CLI_BIN), join(OUT, CLI_BIN));
  // People who find the package on npm try `npm install` it; the npm page says what to do instead.
  const notice =
    "> **This is a template, not a library.** Don't `npm install` it. Create an app with " +
    '`npx create-bareship <name>`.\n\n';
  writeFileSync(join(OUT, 'README.md'), notice + readFileSync(join(ROOT, 'README.md'), 'utf8'));
  if (existsSync(join(ROOT, 'LICENSE'))) {
    copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'LICENSE'));
    // The app is the user's to license; the template's MIT notice travels with it under its own name.
    copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'template', 'TEMPLATE-LICENSE'));
  }

  const tarball = execFileSync('npm', ['pack', '--silent'], { cwd: OUT, encoding: 'utf8' }).trim();
  console.log(`Packed ${appFiles.length} app files into dist/npm/${tarball}`);

  // The installer: only the files its package.json lists, plus the license.
  for (const file of ['package.json', 'README.md', CLI_BIN]) {
    mkdirSync(dirname(join(CLI_OUT, file)), { recursive: true });
    copyFileSync(join(CLI, file), join(CLI_OUT, file));
  }
  copyFileSync(join(ROOT, 'LICENSE'), join(CLI_OUT, 'LICENSE'));
  const cliTarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', OUT], {
    cwd: CLI_OUT,
    encoding: 'utf8',
  }).trim();
  console.log(`Packed the installer into dist/npm/${cliTarball}`);
  console.log(
    `Try it: npx --package ${join(OUT, cliTarball)} create-bareship MyApp --template ${join(OUT, tarball)} --bundle-id com.myapp.app --yes`,
  );
}

main();
