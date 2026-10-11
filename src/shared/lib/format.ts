import RelativeTimeFormat from 'relative-time-format';
// The .json paths skip the locale folders, whose package.json Metro warns about.
import ar from 'relative-time-format/locale/ar.json';
import en from 'relative-time-format/locale/en.json';

import { currentLanguage } from '@/shared/i18n';

// Hermes has no Intl.RelativeTimeFormat. Add each language in LANGUAGES here (a test checks).
RelativeTimeFormat.addLocale(en);
RelativeTimeFormat.addLocale(ar);

/** Locale-aware formatting via Intl (Hermes ships Intl). */
export function formatDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  return new Intl.DateTimeFormat(currentLanguage(), options).format(new Date(value));
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(currentLanguage(), options).format(value);
}

/** "3 min ago", "2 days ago". */
export function formatRelative(value: string | number | Date, now: number = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: Array<[Parameters<RelativeTimeFormat['format']>[1], number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const rtf = new RelativeTimeFormat(currentLanguage(), { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}
