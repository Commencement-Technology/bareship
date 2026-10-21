// Renders the 1200×630 share images (og:image, twitter:image) from SVG: public/og.png for the home page and
// every page without its own, and public/og/<page>.png for the pages listed below. Each shows the brand, a
// headline, the create command and the app offline (an Android screenshot). src/og-pages.json lists the pages
// that have an image, for src/routeData.ts. Run after changing the brand, a headline or the screenshot:
//   node scripts/og-image.mjs
// The text uses the Mac's Helvetica Neue and Menlo, so run it on a Mac and commit the images: Vercel's build
// machines don't have those fonts.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const shot = `${root}public/screenshots/android/07-offline.jpg`;

// Headline lines per page; the last line is drawn in the accent colour. Keep lines under ~22 characters.
const pages = [
  { slug: 'index', lines: ['Offline-first', 'React Native,', 'in one command.'] },
  {
    slug: 'start-here/introduction',
    lines: ['A React Native', 'template with the', 'hard parts done'],
  },
  { slug: 'start-here/how-to-choose', lines: ['How to choose a', 'React Native', 'template'] },
  { slug: 'start-here/quick-start', lines: ['From one command', 'to a running app'] },
  { slug: 'start-here/faq', lines: ['Accounts, Expo,', 'offline, AI agents:', 'your questions'] },
  { slug: 'build/offline', lines: ['Writes that survive', 'airplane mode'] },
  { slug: 'build/ai-agents', lines: ['A React Native', 'template your', 'AI agent follows'] },
];

const sans = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const mono = 'Menlo, monospace';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// The phone: the screenshot inside a dark bezel, cropped so it runs off the top edge and shows everything
// from the screen title to "Waiting to sync".
const screenWidth = 290;
const bezel = 12;
const radius = 34;
const meta = await sharp(shot).metadata();
const screenHeight = Math.round((screenWidth / meta.width) * meta.height);
const screen = await sharp(shot)
  .resize(screenWidth, screenHeight)
  .composite([
    {
      input: Buffer.from(
        `<svg width="${screenWidth}" height="${screenHeight}"><rect width="${screenWidth}" height="${screenHeight}" rx="${radius}"/></svg>`,
      ),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();
const phoneWidth = screenWidth + bezel * 2;
const phoneHeight = screenHeight + bezel * 2;
const framed = await sharp(
  Buffer.from(
    `<svg width="${phoneWidth}" height="${phoneHeight}"><rect width="${phoneWidth}" height="${phoneHeight}" rx="${radius + bezel}" fill="#0d1b22"/></svg>`,
  ),
)
  .composite([{ input: screen, left: bezel, top: bezel }])
  .png()
  .toBuffer();
// Start just above the screen's "Feed" title (y = 90 in the 1428 px screenshot).
const cropTop = bezel + Math.round((90 / meta.height) * screenHeight);
const phone = await sharp(framed)
  .extract({ left: 0, top: cropTop, width: phoneWidth, height: phoneHeight - cropTop })
  .toBuffer();

function svg(lines) {
  const size = lines.length > 2 ? 54 : 60;
  const gap = Math.round(size * 1.15);
  const first = lines.length > 2 ? 232 : 258;
  const headline = lines
    .map(
      (line, i) =>
        `<text x="72" y="${first + i * gap}" font-size="${size}"${i === lines.length - 1 ? ' fill="#7fd1f2"' : ''}>${esc(line)}</text>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="glow" cx="0.82" cy="0.3" r="0.6"><stop offset="0" stop-color="#0f4f6c"/><stop offset="1" stop-color="#0a141a"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(72 70) scale(1.3)" fill="#7fd1f2">
    <path d="M31.5 6H40.5A8.5 8.5 0 0 1 40.5 23H42A9.5 9.5 0 0 1 42 42H31.5Z"/>
    <path d="M27.5 12V42H11.5Z"/>
    <path d="M4 47H60L51 59H13Z"/>
  </g>
  <text x="164" y="122" font-family="${sans}" font-size="46" font-weight="700" fill="#ffffff">Bareship</text>
  <g font-family="${sans}" font-weight="700" fill="#ffffff" letter-spacing="-1">${headline}</g>
  <rect x="72" y="400" width="600" height="110" rx="14" fill="#11232c" stroke="#2a4a5a"/>
  <circle cx="100" cy="424" r="7" fill="#ff5f57"/><circle cx="124" cy="424" r="7" fill="#febc2e"/><circle cx="148" cy="424" r="7" fill="#28c840"/>
  <text x="100" y="482" font-family="${mono}" font-size="30" fill="#7fd1f2">$ <tspan fill="#ffffff">npx create-bareship MyApp</tspan></text>
  <text x="72" y="572" font-family="${sans}" font-size="24" fill="#8fb3c4">Free · MIT · iOS and Android · AI-agent ready</text>
</svg>`;
}

rmSync(`${root}public/og`, { recursive: true, force: true });
for (const page of pages) {
  const file = page.slug === 'index' ? 'og.png' : `og/${page.slug}.png`;
  mkdirSync(`${root}public/${file}`.replace(/\/[^/]+$/, ''), { recursive: true });
  await sharp(Buffer.from(svg(page.lines)))
    .composite([{ input: phone, left: 1200 - phoneWidth - 90, top: 0 }])
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(`${root}public/${file}`);
}
writeFileSync(
  `${root}src/og-pages.json`,
  `${JSON.stringify(
    pages.filter(p => p.slug !== 'index').map(p => p.slug),
    null,
    2,
  )}\n`,
);
console.log(`og-image: wrote ${pages.length} images and src/og-pages.json`);
