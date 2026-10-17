import './intl-polyfills';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';
import { findBestLanguageTag } from 'react-native-localize';

import { services } from '@/shared/services/services';

import en from './locales/en.json';
import hi from './locales/hi.json';

type LanguageInfo = {
  /** The language's own name, shown in Settings. */
  label: string;
  /** Right-to-left script (Arabic, Hebrew, Persian, Urdu). Switching to or from it needs a restart. */
  rtl: boolean;
};

/**
 * The app's languages. To add one: a locale file in ./locales, an entry here, and its relative-time
 * data in src/shared/lib/format.ts. A right-to-left language only needs `rtl: true` (docs/decisions/0017).
 */
export const LANGUAGES = {
  en: { label: 'English', rtl: false },
  hi: { label: 'हिन्दी', rtl: false },
} as const satisfies Record<string, LanguageInfo>;

export type Language = keyof typeof LANGUAGES;

export const resources = { en: { translation: en }, hi: { translation: hi } } as const;

const STORAGE_KEY = 'settings.language';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in LANGUAGES;
}

/** The saved choice, else the best match for the device's languages, else English. */
export function resolveInitialLanguage(): Language {
  const saved = services().kv.getString(STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  const best = findBestLanguageTag(Object.keys(LANGUAGES))?.languageTag;
  return isLanguage(best) ? best : 'en';
}

export function initI18n(language: Language = resolveInitialLanguage()) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: { escapeValue: false }, // React already escapes
      returnNull: false,
    });
  }
  applyDirection(LANGUAGES[language].rtl);
  return i18n;
}

/**
 * Switches language and saves it. Returns true when the layout direction changed, which only takes
 * full effect after a restart (React Native reads I18nManager at launch).
 */
export async function changeLanguage(language: Language): Promise<boolean> {
  services().kv.set(STORAGE_KEY, language);
  await i18n.changeLanguage(language);
  return applyDirection(LANGUAGES[language].rtl);
}

export function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : 'en';
}

/**
 * Sets the layout direction for the next launch. Returns true when it differs from the current launch,
 * so a restart is needed. Exported so tests cover right-to-left without the app shipping an RTL language.
 */
export function applyDirection(rtl: boolean): boolean {
  I18nManager.allowRTL(rtl);
  // Always persist the wanted direction. I18nManager.isRTL is fixed at launch, so comparing against it
  // alone would skip forceRTL(false) on LTR → RTL → LTR and the next launch would come up RTL.
  I18nManager.forceRTL(rtl);
  return I18nManager.isRTL !== rtl;
}

/** Development builds can reload in place; release builds ask the user to restart. */
export function reloadForDirectionChange(): boolean {
  if (__DEV__) {
    DevSettings.reload();
    return true;
  }
  return false;
}

export { i18n };
export { useTranslation } from 'react-i18next';
