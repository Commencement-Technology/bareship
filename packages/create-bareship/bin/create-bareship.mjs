#!/usr/bin/env node
/**
 * Creates a React Native app from the Bareship template in one command (ADR 0018):
 *
 *   npx create-bareship Acme [--bundle-id com.acme.app] [--display-name "Acme"] [--yes]
 *
 * Checks the tools, asks for what's missing, then runs the manual quick start: React Native CLI `init`
 * with `--skip-install`, `pnpm install`, `bundle install`, `pnpm bootstrap`. It creates the app from the
 * template version that matches its own (create-bareship@X → bareship@X). The `bareship` package ships
 * this file as its `bin`, so `npx bareship Acme` does the same.
 *
 * Node built-ins only: this runs before the app's supply-chain policy exists (ADR 0003).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const VERSION = pkg.version;
const COMMAND = `npx ${pkg.name}`;
// The React Native CLI the template is tested with (its devDependencies pin the same version).
const RN_CLI = '@react-native-community/cli@20.2.0';
const MIN_NODE = [22, 11];
const MIN_PNPM = 11;
const JAVA = 21;
const IS_MAC = process.platform === 'darwin';
const IS_WINDOWS = process.platform === 'win32';

const NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const BUNDLE_ID_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
// The display name goes into Gradle strings, plists and regular expressions.
const DISPLAY_NAME_PATTERN = /^[^"\\$<>&`]+$/;
const RESERVED_NAMES = ['React', 'ReactNative', 'BareshipApp', 'Test'];

const HELP = `Create a React Native app from the Bareship template (bareship@${VERSION}).

Usage
  ${COMMAND} <AppName> [options]

Options
  --bundle-id <id>        Reverse-domain bundle id, like com.acme.app (default: com.<appname>.app)
  --display-name <name>   Name under the app icon (default: the app name)
  -y, --yes               Ask nothing; use the defaults for anything not given (CI, AI agents)
  --skip-pods             Don't run pod install (default off macOS; use it for an Android-only setup)
  --skip-checks           Don't check the required tools first
  --dry-run               Check and print the commands without running them
  -v, --version           Print the version
  -h, --help              Show this help

Example
  ${COMMAND} Acme --bundle-id com.acme.app --display-name "Acme"
`;

// --- Output -------------------------------------------------------------------------------------------

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = code => text => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = paint(1);
const dim = paint(2);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);
const cyan = paint(36);

class UsageError extends Error {}

function fail(message, fix) {
  console.error(`\n${red('✖')} ${message}`);
  if (fix) console.error(`  ${fix.split('\n').join('\n  ')}`);
  process.exit(1);
}

/** Quotes an argument for display, the way a user would type it in a POSIX shell. */
function shellQuote(arg) {
  return /^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`;
}

// --- Arguments ----------------------------------------------------------------------------------------

function readArgs(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        'bundle-id': { type: 'string' },
        'display-name': { type: 'string' },
        yes: { type: 'boolean', short: 'y', default: false },
        'skip-pods': { type: 'boolean', default: false },
        'skip-checks': { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        // Hidden: a local template (a folder or a .tgz from `pnpm pack-template`) instead of npm.
        template: { type: 'string' },
        version: { type: 'boolean', short: 'v', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (error) {
    throw new UsageError(error.message);
  }
  if (parsed.positionals.length > 1)
    throw new UsageError(`Expected one app name, got: ${parsed.positionals.join(' ')}`);
  return { name: parsed.positionals[0], ...parsed.values };
}

function nameProblem(name) {
  if (!NAME_PATTERN.test(name))
    return `"${name}" isn't a valid app name. Start with a capital letter and use only letters and digits, like AcmeShop.`;
  if (RESERVED_NAMES.includes(name)) return `"${name}" is reserved. Pick another app name.`;
  if (existsSync(resolve(name)))
    return `A folder named "${name}" already exists here. Pick another name or remove the folder.`;
  return undefined;
}

function bundleIdProblem(id) {
  if (!BUNDLE_ID_PATTERN.test(id))
    return `"${id}" isn't a valid bundle id. Use lowercase reverse-domain form, like com.acme.app.`;
  return undefined;
}

function displayNameProblem(displayName) {
  if (!displayName.trim()) return 'The display name is empty.';
  if (!DISPLAY_NAME_PATTERN.test(displayName))
    return `The display name can't contain " \\ $ < > & or \`.`;
  return undefined;
}

const defaultBundleId = name => `com.${name.toLowerCase()}.app`;

/** Fills in the app name, bundle id and display name from flags, prompts or defaults, and validates them. */
async function collectAnswers(args) {
  const interactive = !args.yes && process.stdin.isTTY && process.stdout.isTTY;
  const rl = interactive
    ? createInterface({ input: process.stdin, output: process.stdout })
    : undefined;
  const ask = async (question, fallback, problem) => {
    for (;;) {
      const answer = (
        await rl.question(`${cyan('?')} ${question} ${dim(`(${fallback})`)} `)
      ).trim();
      const value = answer || fallback;
      const issue = problem(value);
      if (!issue) return value;
      console.log(`  ${red(issue)}`);
    }
  };

  try {
    let name = args.name;
    if (!name) {
      if (!rl) throw new UsageError(`Give the app name: ${COMMAND} <AppName>`);
      name = await ask('App name', 'MyApp', nameProblem);
    }
    const nameIssue = nameProblem(name);
    if (nameIssue) throw new UsageError(nameIssue);

    let bundleId = args['bundle-id'];
    if (bundleId === undefined && rl)
      bundleId = await ask('Bundle id', defaultBundleId(name), bundleIdProblem);
    bundleId ??= defaultBundleId(name);
    const bundleIssue = bundleIdProblem(bundleId);
    if (bundleIssue) throw new UsageError(bundleIssue);

    let displayName = args['display-name'];
    if (displayName === undefined && rl)
      displayName = await ask('Display name', name, displayNameProblem);
    displayName ??= name;
    const displayIssue = displayNameProblem(displayName);
    if (displayIssue) throw new UsageError(displayIssue);

    return { name, bundleId, displayName };
  } finally {
    rl?.close();
  }
}

// --- Tool checks --------------------------------------------------------------------------------------

/** Runs a command quietly and returns its combined output, or undefined if it couldn't run or failed. */
function probe(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: IS_WINDOWS,
    env: { ...process.env, COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
    timeout: 30_000,
  });
  if (result.error || result.status !== 0) return undefined;
  return `${result.stdout}${result.stderr}`.trim();
}

const major = version => Number(version?.match(/(\d+)/)?.[1] ?? NaN);

function checkTools({ skipPods }) {
  const checks = [];
  const check = (label, ok, detail, fix) => checks.push({ label, ok, detail, fix });

  const node = process.versions.node;
  const [nodeMajor, nodeMinor] = node.split('.').map(Number);
  check(
    'Node',
    nodeMajor > MIN_NODE[0] || (nodeMajor === MIN_NODE[0] && nodeMinor >= MIN_NODE[1]),
    node,
    `Install Node ${MIN_NODE.join('.')} or later (24 recommended): https://nodejs.org`,
  );

  const pnpm = probe('pnpm', ['--version']);
  check(
    'pnpm',
    pnpm !== undefined && major(pnpm) >= MIN_PNPM,
    pnpm ?? 'not found',
    `Run \`corepack enable\` (on Node 25 or later, first \`npm install -g corepack\`).\n` +
      `The app pins its pnpm version, and Corepack picks it up. Or install pnpm 12: https://pnpm.io/installation`,
  );

  const ruby = probe('ruby', ['--version']);
  check(
    'Ruby',
    ruby !== undefined,
    ruby?.split(' ')[1] ?? 'not found',
    'Install Ruby 3.2 or later, for example with rbenv: https://github.com/rbenv/rbenv',
  );
  const bundler = probe('bundle', ['--version']);
  check(
    'Bundler',
    bundler !== undefined,
    bundler?.match(/[\d.]+/)?.[0] ?? 'not found',
    'Run `gem install bundler`.',
  );

  // macOS ships a /usr/bin/java stub that fails without a JDK, so look at the version it reports.
  const java = probe('java', ['-version']);
  const javaVersion = java?.match(/version "([^"]+)"/)?.[1];
  check(
    'Java',
    javaVersion !== undefined && major(javaVersion) >= JAVA,
    javaVersion ?? 'not found',
    `Install JDK ${JAVA} (Android builds need it), for example Zulu or Temurin, and set JAVA_HOME.\n` +
      `iOS only? Add --skip-checks to go on without it.`,
  );

  if (IS_MAC && !skipPods) {
    const xcode = probe('xcodebuild', ['-version']);
    check(
      'Xcode',
      xcode !== undefined,
      xcode?.split('\n')[0]?.replace('Xcode ', '') ?? 'not found',
      'Install Xcode from the App Store, open it once, then run `sudo xcode-select -s /Applications/Xcode.app`.\n' +
        'Android only? Add --skip-pods.',
    );
    // CocoaPods itself comes from the app's Gemfile (`bundle install`), so there's nothing global to check.
  }
  return checks;
}

function reportChecks(checks, { strict }) {
  console.log(bold('Checking your tools'));
  for (const { label, ok, detail } of checks)
    console.log(`  ${ok ? green('✔') : red('✖')} ${label.padEnd(8)} ${dim(detail)}`);
  const missing = checks.filter(c => !c.ok);
  if (missing.length === 0) return;
  const fixes = missing.map(c => `${bold(c.label)}: ${c.fix.split('\n').join('\n  ')}`).join('\n');
  if (strict)
    fail('Some tools are missing or too old. Fix these, then run the command again:', fixes);
  console.log(
    `\n${yellow('!')} Missing or too old (a real run would stop here):\n  ${fixes.split('\n').join('\n  ')}`,
  );
}

// --- Steps --------------------------------------------------------------------------------------------

function templateSpec(template) {
  if (!template) return `bareship@${VERSION}`;
  const local = resolve(template);
  return existsSync(local) ? `file:${local}` : template;
}

function plan({ name, bundleId, displayName }, args) {
  const appDir = resolve(name);
  const skipPods = args['skip-pods'] || !IS_MAC;
  const bootstrap = ['bootstrap', '--bundle-id', bundleId, '--display-name', displayName];
  if (skipPods) bootstrap.push('--skip-pods');
  // `init` can't install with pnpm (docs/packaging.md), so it skips the install, and pnpm installs with the
  // app's lockfile and policy. No --package-name: bootstrap sets the id without breaking the iOS suffixes.
  return [
    {
      title: `Creating ${name} from ${templateSpec(args.template)}`,
      command: 'npx',
      args: [
        '--yes',
        RN_CLI,
        'init',
        name,
        '--template',
        templateSpec(args.template),
        '--pm',
        'npm',
        '--skip-install',
        '--install-pods',
        'false',
        '--skip-git-init',
      ],
      cwd: process.cwd(),
      // Its own next steps (`npx react-native run-android`) don't apply, so its output shows only on failure.
      quiet: true,
      // It reports some failures (no npm, a template it can't fetch) with exit code 0.
      done: () => existsSync(resolve(appDir, 'package.json')),
    },
    {
      title: 'Installing JavaScript dependencies',
      command: 'pnpm',
      args: ['install'],
      cwd: appDir,
    },
    {
      title: 'Installing Ruby gems (CocoaPods, fastlane)',
      command: 'bundle',
      args: ['install'],
      cwd: appDir,
    },
    {
      title: skipPods
        ? 'Setting the bundle id and display name'
        : 'Setting the bundle id and installing pods',
      command: 'pnpm',
      args: bootstrap,
      cwd: appDir,
    },
  ];
}

function childEnv() {
  // CocoaPods fails on a non-UTF-8 terminal.
  const env = {
    ...process.env,
    LANG: process.env.LANG || 'en_US.UTF-8',
    COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
  };
  // Run as `npx --package <tarball> create-bareship`, npm exports the package, and the `npx` for `init`
  // would then look for the React Native CLI inside it.
  delete env.npm_config_package;
  return env;
}

function run(step, index, total) {
  console.log(`\n${cyan(`[${index}/${total}]`)} ${bold(step.title)}`);
  console.log(dim(`  $ ${[step.command, ...step.args].map(shellQuote).join(' ')}`));
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    // A quiet step's output is shown only if it fails.
    stdio: step.quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
    shell: IS_WINDOWS,
    env: childEnv(),
  });
  if (result.error) fail(`Couldn't run ${step.command}: ${result.error.message}`);
  const ok = result.status === 0 && (step.done?.() ?? true);
  if (!ok) {
    if (step.quiet) process.stderr.write(`${result.stdout}${result.stderr}`);
    fail(
      `${step.title} failed${result.status ? ` (exit code ${result.status})` : ''}.`,
      'Fix the error above. The app folder may be half set up: delete it and run the command again.',
    );
  }
  if (step.quiet) console.log(`  ${green('✔')} Done`);
}

/** A git repository with one commit, unless the app is inside one already. Husky needs it before install. */
function gitInit(appDir) {
  if (probe('git', ['--version']) === undefined) return false;
  const inside = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: appDir,
    stdio: 'ignore',
  });
  if (inside.status === 0) return false;
  return spawnSync('git', ['init', '-q'], { cwd: appDir, stdio: 'ignore' }).status === 0;
}

function gitCommit(appDir) {
  spawnSync('git', ['add', '-A'], { cwd: appDir, stdio: 'ignore' });
  const commit = spawnSync(
    'git',
    ['commit', '-q', '--no-verify', '-m', `chore: create app from bareship@${VERSION}`],
    {
      cwd: appDir,
      stdio: 'ignore',
    },
  );
  return commit.status === 0;
}

function printNextSteps({ name, bundleId }, { committed, skipPods }) {
  console.log(
    `\n${green('✔')} ${bold(`Created ${name}`)} ${dim(`(${bundleId}, from bareship@${VERSION})`)}`,
  );
  if (committed === false)
    console.log(dim(`  The files are staged in git; commit them when you're ready.`));
  console.log(`
Next:
  ${cyan(`cd ${shellQuote(name)}`)}
  ${cyan('pnpm ios')}              ${dim(`# a simulator (macOS)${skipPods && IS_MAC ? '; run `pnpm pods` first' : ''}`)}
  ${cyan('pnpm android')}          ${dim('# start an emulator or plug in a phone first')}

Sign in with ${bold('demo@example.com')} / ${bold('password123')}: the dev build serves sample data.
When you're ready to build your own app: ${cyan('pnpm strip-examples')}, then ${cyan('pnpm gen feature <name>')}.
Docs: https://bareship.praveensingh.co.in
`);
}

// --- Main ---------------------------------------------------------------------------------------------

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (args.version) {
    console.log(VERSION);
    return;
  }

  console.log(`${bold('Bareship')} ${dim(`v${VERSION}`)}\n`);
  const answers = await collectAnswers(args);
  const skipPods = args['skip-pods'] || !IS_MAC;

  if (!args['skip-checks']) {
    reportChecks(checkTools({ skipPods }), { strict: !args['dry-run'] });
  }

  const steps = plan(answers, args);
  if (args['dry-run']) {
    console.log(`\n${bold('Would run')} ${dim('(--dry-run)')}`);
    for (const step of steps) {
      const where = step.cwd === process.cwd() ? '' : `cd ${shellQuote(answers.name)} && `;
      console.log(`  ${where}${[step.command, ...step.args].map(shellQuote).join(' ')}`);
    }
    return;
  }

  const appDir = resolve(answers.name);
  run(steps[0], 1, steps.length);
  const ownRepo = gitInit(appDir);
  steps.slice(1).forEach((step, i) => run(step, i + 2, steps.length));
  const committed = ownRepo ? gitCommit(appDir) : undefined;
  printNextSteps(answers, { committed, skipPods });
}

main().catch(error => {
  if (error instanceof UsageError) {
    console.error(`${red('✖')} ${error.message}\n  Run ${COMMAND} --help for the options.`);
    process.exit(1);
  }
  throw error;
});
