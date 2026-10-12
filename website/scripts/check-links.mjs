/**
 * Fails the build when a page links to something on this site that doesn't exist: a missing page or file,
 * or a `#heading` that isn't on the target page. Runs after `astro build` (pnpm build), over dist/.
 *
 * Links break when the repo's docs change (a renamed file, a reworded heading), so this catches them before
 * the site goes out. Links to other sites aren't checked.
 *
 *   node scripts/check-links.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

if (!existsSync(DIST)) {
  console.error('check-links: no dist/ folder. Run `astro build` first.');
  process.exit(1);
}

function pages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return pages(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

/** The built file a site path points to, or null. `/a/b/` → dist/a/b/index.html. */
function target(path) {
  const file = join(DIST, decodeURIComponent(path));
  if (existsSync(file) && statSync(file).isFile()) return file;
  const index = join(file, 'index.html');
  return existsSync(index) ? index : null;
}

const ids = new Map();
function idsOf(file) {
  if (!ids.has(file)) {
    ids.set(
      file,
      new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(match => match[1])),
    );
  }
  return ids.get(file);
}

const broken = [];
let checked = 0;
for (const page of pages(DIST)) {
  const html = readFileSync(page, 'utf8');
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(href) || href.startsWith('//')) continue;
    const [pathPart, anchor] = href.split('#');
    let path = pathPart.split('?')[0];
    if (path === '') path = `/${relative(DIST, page)}`; // same-page anchor
    if (!path.startsWith('/')) continue; // relative asset paths inside generated files
    checked += 1;
    const file = target(path);
    if (!file) {
      broken.push({ page, href, reason: 'no such page or file' });
    } else if (anchor && file.endsWith('.html') && !idsOf(file).has(decodeURIComponent(anchor))) {
      broken.push({ page, href, reason: `no "#${anchor}" heading on that page` });
    }
  }
}

if (broken.length > 0) {
  console.error(`check-links: ${broken.length} broken link(s):`);
  for (const { page, href, reason } of broken) {
    const from = `/${relative(DIST, page)}`.replace(/index\.html$/, '');
    console.error(`  ${from}  →  ${href}  (${reason})`);
  }
  console.error(
    'Fix the link in the source (docs/, AGENTS.md or website/content/), then build again.',
  );
  process.exit(1);
}
console.log(`check-links: ${checked} links to this site, all found`);
