import { I18nManager } from 'react-native';

import { services } from '@/shared/services/services';

import {
  changeLanguage,
  currentLanguage,
  i18n,
  initI18n,
  LANGUAGES,
  resolveInitialLanguage,
} from './index';

describe('i18n', () => {
  beforeAll(() => {
    initI18n('en');
  });

  it('uses the saved language over the device language', () => {
    expect(resolveInitialLanguage()).toBe('en'); // device mock is en-US
    services().kv.set('settings.language', 'ar');
    expect(resolveInitialLanguage()).toBe('ar');
  });

  it('translates with interpolation and English plurals', () => {
    expect(i18n.t('feed.likes', { count: 1 })).toBe('1 like');
    expect(i18n.t('feed.likes', { count: 3 })).toBe('3 likes');
    expect(i18n.t('auth.forgot.sent', { email: 'a@b.co' })).toContain('a@b.co');
  });

  it('switching to Arabic saves it, uses Arabic plural forms and asks for a restart (RTL)', async () => {
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
    await expect(changeLanguage('ar')).resolves.toBe(true);
    expect(currentLanguage()).toBe('ar');
    expect(services().kv.getString('settings.language')).toBe('ar');
    expect(forceRTL).toHaveBeenCalledWith(true);
    expect(i18n.t('feed.likes', { count: 2 })).toBe('إعجابان');
    expect(i18n.t('feed.likes', { count: 5 })).toBe('5 إعجابات');
    await changeLanguage('en');
    forceRTL.mockRestore();
  });
});

describe('layout direction', () => {
  it('switching to Arabic and back before restarting leaves the saved direction LTR', async () => {
    initI18n('en');
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
    await expect(changeLanguage('ar')).resolves.toBe(true); // restart needed
    await expect(changeLanguage('en')).resolves.toBe(false); // back to the launch direction
    expect(forceRTL).toHaveBeenLastCalledWith(false);
    forceRTL.mockRestore();
  });
});

describe('Intl polyfills', () => {
  // Hermes has no Intl.PluralRules / RelativeTimeFormat; without locale data a language
  // silently loses its plural forms on device even though Jest (Node Intl) still passes.
  it('load plural and relative-time data for every supported language', () => {
    const source = jest
      .requireActual<typeof import('fs')>('fs')
      .readFileSync(require.resolve('./intl-polyfills'), 'utf8');
    for (const language of Object.keys(LANGUAGES)) {
      expect(source).toContain(`intl-pluralrules/locale-data/${language}.js`);
      expect(source).toContain(`intl-relativetimeformat/locale-data/${language}.js`);
    }
  });
});
