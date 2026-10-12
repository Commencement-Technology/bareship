/**
 * Generates the files a website must serve so links to it open the app (ADR 0010, docs/going-live.md):
 *
 *   https://<APP_LINK_DOMAIN>/.well-known/apple-app-site-association   (iOS universal links)
 *   https://<APP_LINK_DOMAIN>/.well-known/assetlinks.json              (Android App Links)
 *
 *   pnpm links:files --team-id ABCDE12345 [--sha256 AA:BB:…] [--env prod]
 *
 * --team-id   Apple Developer Team ID (Apple Developer account → Membership). Needed for iOS.
 * --sha256    SHA-256 fingerprint of the Android signing certificate. Repeat it for several (upload key and
 *             Play App Signing key: Play Console → Test and release → App integrity). Without it, the script
 *             reads RN_UPLOAD_STORE_FILE with keytool.
 * --env       Only this environment (dev, staging or prod). Default: every environment with APP_LINK_DOMAIN.
 *
 * Output: dist/well-known/<env>/. Upload both files to the domain's /.well-known/ folder, served as
 * application/json over HTTPS without redirects.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(__dirname, '..');

/** Paths the app handles. Keep in sync with the `linking` paths in src/app/navigation/RootNavigator.tsx. */
const LINK_PATHS: string[] = ['/post/*']; // @example:link-paths

const ENVIRONMENTS = [
  { name: 'dev', suffix: '.dev' },
  { name: 'staging', suffix: '.staging' },
  { name: 'prod', suffix: '' },
] as const;

const { values } = parseArgs({
  options: {
    'team-id': { type: 'string' },
    sha256: { type: 'string', multiple: true },
    env: { type: 'string' },
  },
});

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function readEnv(name: string): Record<string, string> {
  const file = join(root, `.env.${name}`);
  if (!existsSync(file)) fail(`Missing .env.${name}`);
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split('\n')
      .map(line => /^\s*(?:export\s+)?([A-Za-z_][\w.-]*)\s*=\s*['"]?(.*?)['"]?\s*$/.exec(line))
      .flatMap(match => (match?.[1] ? [[match[1], match[2] ?? '']] : [])),
  );
}

function fingerprints(): string[] {
  if (values.sha256?.length) return values.sha256.map(value => value.toUpperCase());
  const store = process.env.RN_UPLOAD_STORE_FILE;
  if (!store) return [];
  const output = execFileSync(
    'keytool',
    ['-list', '-v', '-keystore', store, '-storepass', process.env.RN_UPLOAD_STORE_PASSWORD ?? ''],
    { encoding: 'utf8' },
  );
  return [...output.matchAll(/SHA256:\s*([0-9A-F:]{95})/g)].flatMap(match =>
    match[1] ? [match[1]] : [],
  );
}

const teamId = values['team-id'];
if (teamId !== undefined && !/^[A-Z0-9]{10}$/.test(teamId)) {
  fail('--team-id is the 10-character Apple Team ID, e.g. ABCDE12345');
}
const gradle = readFileSync(join(root, 'android/app/build.gradle'), 'utf8');
const baseId =
  /applicationId\s+"([^"]+)"/.exec(gradle)?.[1] ?? fail('No applicationId in build.gradle');
const certs = fingerprints();

const selected = ENVIRONMENTS.filter(env => !values.env || env.name === values.env);
if (selected.length === 0) fail(`Unknown --env ${values.env}`);

let written = 0;
for (const env of selected) {
  const domain = readEnv(env.name).APP_LINK_DOMAIN;
  if (!domain) {
    console.log(`– ${env.name}: APP_LINK_DOMAIN is empty, skipped`);
    continue;
  }
  const appId = `${baseId}${env.suffix}`;
  const dir = join(root, 'dist/well-known', env.name);
  mkdirSync(dir, { recursive: true });

  if (teamId) {
    const aasa = {
      applinks: {
        details: [
          { appIDs: [`${teamId}.${appId}`], components: LINK_PATHS.map(path => ({ '/': path })) },
        ],
      },
    };
    writeFileSync(join(dir, 'apple-app-site-association'), `${JSON.stringify(aasa, null, 2)}\n`);
  } else {
    console.log(`  ${env.name}: no --team-id, skipping apple-app-site-association`);
  }

  if (certs.length) {
    const assetLinks = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: { namespace: 'android_app', package_name: appId, sha256_cert_fingerprints: certs },
      },
    ];
    writeFileSync(join(dir, 'assetlinks.json'), `${JSON.stringify(assetLinks, null, 2)}\n`);
  } else {
    console.log(`  ${env.name}: no --sha256 or RN_UPLOAD_STORE_FILE, skipping assetlinks.json`);
  }

  written += 1;
  console.log(
    `✓ ${env.name}: dist/well-known/${env.name}/ → upload to https://${domain}/.well-known/`,
  );
}
if (written === 0) console.log('Nothing to do: set APP_LINK_DOMAIN in an .env file first.');
