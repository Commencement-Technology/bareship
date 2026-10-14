// Renders public/og.png, the 1200×630 share image (og:image, twitter:image), from an SVG: the brand mark,
// name and tagline in the site's light-mode accent. Run after changing the brand or tagline:
//   node scripts/og-image.mjs
import sharp from 'sharp';

const accent = '#0A6C96';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4fafd"/>
      <stop offset="1" stop-color="#d3ebf6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(96 150) scale(0.42)" fill="none" stroke="${accent}" stroke-width="34" stroke-linejoin="round" stroke-linecap="round">
    <path d="M300 70 L530 185 L300 300 L70 185 Z" fill="${accent}"/>
    <path d="M70 300 L300 415 L530 300"/>
    <path d="M70 400 L300 515 L530 400"/>
  </g>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="#0b2c3c">
    <text x="380" y="270" font-size="96" font-weight="700" letter-spacing="-2">Bareship</text>
    <text x="384" y="340" font-size="36" fill="#064a68">Offline-first, bare React Native template</text>
    <text x="384" y="388" font-size="36" fill="#064a68">for teams and AI agents</text>
  </g>
  <g font-family="Menlo, monospace" font-size="26" fill="#3d5f70">
    <text x="96" y="530">npm · GitHub template · MIT · iOS and Android</text>
  </g>
  <text x="96" y="572" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26" fill="#3d5f70">bareship.praveensingh.co.in</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(new URL('../public/og.png', import.meta.url).pathname);
console.log('og-image: wrote public/og.png');
