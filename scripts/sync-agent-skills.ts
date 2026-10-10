/**
 * Vendors Callstack's React Native agent skills into .claude/skills at a pinned commit (ADR 0011).
 *
 *   pnpm skills:sync              re-sync the commit recorded in .claude/skills/skills-lock.json
 *   pnpm skills:sync <ref>        move to another commit, tag or branch (review the diff, then commit)
 *
 * Only the skills listed below are replaced; the template's own skills in .claude/skills are kept.
 * Profiler screenshots (~6 MB) are not copied: image links point at the same pinned commit upstream.
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const REPO = 'callstackincubator/agent-skills';
const ROOT = join(__dirname, '..');
const DEST = join(ROOT, '.claude', 'skills');
const LOCK = join(DEST, 'skills-lock.json');

/** Skill name → folder in the upstream repo. External skills come from its vendored copies. */
const SKILLS: Record<string, string> = {
  'react-native-best-practices': 'skills/react-native-best-practices',
  'react-navigation': 'skills/react-navigation',
  'upgrading-react-native': 'skills/upgrading-react-native',
  'github-actions': 'skills/github-actions',
  'create-react-native-library': 'skills/create-react-native-library',
  'react-native-tv-best-practices': 'skills/react-native-tv-best-practices',
  'assess-react-native-migration': 'skills/assess-react-native-migration',
  'react-native-brownfield-migration': 'skills/react-native-brownfield-migration',
  'writing-user-docs': 'skills/writing-user-docs',
  // Upstream: callstack/react-native-testing-library and callstackincubator/agent-device.
  'react-native-testing': 'plugins/vendored/.agents/skills/react-native-testing',
  'agent-device': 'plugins/vendored/.agents/skills/agent-device',
  dogfood: 'plugins/vendored/.agents/skills/dogfood',
};

const LICENSES = [
  {
    file: 'LICENSE-agent-skills',
    url: `https://raw.githubusercontent.com/${REPO}/{commit}/LICENSE`,
  },
  {
    file: 'LICENSE-agent-device',
    url: 'https://raw.githubusercontent.com/callstackincubator/agent-device/main/LICENSE',
  },
  {
    file: 'LICENSE-react-native-testing-library',
    url: 'https://raw.githubusercontent.com/callstack/react-native-testing-library/main/LICENSE',
  },
];

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

async function main() {
  const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : undefined;
  const ref: string | undefined = process.argv[2] ?? lock?.commit;
  if (!ref) throw new Error('Pass a commit, tag or branch: pnpm skills:sync <ref>');

  const work = mkdtempSync(join(tmpdir(), 'agent-skills-'));
  try {
    const src = join(work, 'src');
    git(work, 'clone', '--quiet', '--filter=blob:none', `https://github.com/${REPO}.git`, src);
    git(src, 'checkout', '--quiet', ref);
    const commit = git(src, 'rev-parse', 'HEAD');

    for (const [name, from] of Object.entries(SKILLS)) {
      const target = join(DEST, name);
      rmSync(target, { recursive: true, force: true });
      cpSync(join(src, from), target, { recursive: true });
      rmSync(join(target, 'references', 'images'), { recursive: true, force: true });
      for (const file of files(target).filter(path => path.endsWith('.md'))) {
        const upstream = `https://raw.githubusercontent.com/${REPO}/${commit}/${from}`;
        const dir = relative(target, join(file, '..'));
        const text = readFileSync(file, 'utf8').replace(
          /\]\((\.\/)?images\//g,
          `](${upstream}/${dir ? `${dir}/` : ''}images/`,
        );
        writeFileSync(file, text);
      }
    }

    for (const { file, url } of LICENSES) {
      const response = await fetch(url.replace('{commit}', commit));
      if (!response.ok) throw new Error(`Couldn't fetch ${url}: ${response.status}`);
      writeFileSync(join(DEST, file), await response.text());
    }

    writeFileSync(
      LOCK,
      `${JSON.stringify(
        {
          source: `https://github.com/${REPO}`,
          commit,
          committedAt: git(src, 'show', '-s', '--format=%cI', 'HEAD'),
          skills: Object.keys(SKILLS),
        },
        null,
        2,
      )}\n`,
    );
    console.log(
      `Vendored ${Object.keys(SKILLS).length} skills at ${commit.slice(0, 7)} into .claude/skills.`,
    );
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
