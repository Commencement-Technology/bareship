/**
 * Hermes ships only Intl.Collator, DateTimeFormat and NumberFormat. i18next plurals need
 * Intl.PluralRules and formatRelative needs Intl.RelativeTimeFormat, so polyfill them here.
 * Each `polyfill.js` is a no-op where the API already exists (Jest, a future Hermes).
 *
 * Adding a language to LANGUAGES? Import its locale data below too (a test checks this).
 */
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/ar.js';
import '@formatjs/intl-relativetimeformat/polyfill.js';
import '@formatjs/intl-relativetimeformat/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/locale-data/ar.js';
