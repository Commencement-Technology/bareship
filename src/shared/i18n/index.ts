import './intl-polyfills';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';
import { findBestLanguageTag } from 'react-native-localize';

import { services } from '@/shared/services/services';

import ar from './locales/ar.json';
import en from './locales/en.json';

export const LANGUAGES = {
  en: { label: 'English', rtl: false },
  ar: { label: 'العربية', rtl: true },
} as const;

export type Language = keyof typeof LANGUAGES;

export const resources = { en: { translation: en }, ar: { translation: ar } } as const;

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
  applyDirection(language);
  return i18n;
}

/**
 * Switches language and saves it. Returns true when the layout direction changed, which only takes
 * full effect after a restart (React Native reads I18nManager at launch).
 */
export async function changeLanguage(language: Language): Promise<boolean> {
  services().kv.set(STORAGE_KEY, language);
  await i18n.changeLanguage(language);
  return applyDirection(language);
}

export function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : 'en';
}

function applyDirection(language: Language): boolean {
  const rtl = LANGUAGES[language].rtl;
  I18nManager.allowRTL(rtl);
  // Always persist the wanted direction. I18nManager.isRTL is fixed at launch, so comparing against it
  // alone would skip forceRTL(false) on en → ar → en and the next launch would come up RTL.
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
