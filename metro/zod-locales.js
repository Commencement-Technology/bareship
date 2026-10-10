/**
 * Stands in for zod's `locales/index.js`, which re-exports ~60 languages (~250 KB) that Metro can't
 * tree-shake. The app shows its own translated messages (schemas use i18n keys), and zod's default
 * English comes from `locales/en.js` directly, so `z.locales` only needs English. Add a language here
 * if you call `z.config(z.locales.xx())`. See metro.config.js and ADR 0011.
 */
export { default as en } from 'zod/v4/locales/en.js';
