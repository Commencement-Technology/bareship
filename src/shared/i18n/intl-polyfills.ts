/**
 * Hermes ships only Intl.Collator, DateTimeFormat and NumberFormat (checked against the Hermes
 * binary, RN 0.87). i18next plurals need Intl.PluralRules: this polyfill (~35 KB, every CLDR
 * language) installs itself only where it's missing. Relative times don't need a global
 * polyfill: src/shared/lib/format.ts uses `relative-time-format` directly.
 *
 * Not FormatJS: its locale matcher needs Intl.Locale, which pulled in ~390 KB of polyfills.
 */
import 'intl-pluralrules';
