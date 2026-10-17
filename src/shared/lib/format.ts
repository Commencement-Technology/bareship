import RelativeTimeFormat from 'relative-time-format';
// The .json paths skip the locale folders, whose package.json Metro warns about.
import en from 'relative-time-format/locale/en.json';
import hi from 'relative-time-format/locale/hi.json';

import { currentLanguage, useTranslation } from '@/shared/i18n';

// Hermes has no Intl.RelativeTimeFormat. Add each language in LANGUAGES here (a test checks).
RelativeTimeFormat.addLocale(en);
RelativeTimeFormat.addLocale(hi);

/** Locale-aware formatting via Intl (Hermes ships Intl). */
export function formatDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  language: string = currentLanguage(),
) {
  return new Intl.DateTimeFormat(language, options).format(new Date(value));
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  language: string = currentLanguage(),
) {
  return new Intl.NumberFormat(language, options).format(value);
}

/** "3 min ago", "2 days ago". */
export function formatRelative(
  value: string | number | Date,
  now: number = Date.now(),
  language: string = currentLanguage(),
) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: Array<[Parameters<RelativeTimeFormat['format']>[1], number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const rtf = new RelativeTimeFormat(language, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}

/**
 * The formatters above, bound to the current language. Components use this, not the plain functions:
 * the React Compiler caches `formatRelative(date)` on its arguments, so after a language switch in
 * Settings the text would stay in the old language. Here the language is an input, so it re-renders.
 */
export function useFormat() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return {
    relative: (value: string | number | Date, now?: number) => formatRelative(value, now, language),
    date: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, options, language),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, options, language),
  };
}
