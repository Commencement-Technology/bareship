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
    expect(i18n.t('offline.pending', { count: 1 })).toContain('1 change will sync');
    expect(i18n.t('offline.pending', { count: 3 })).toContain('3 changes will sync');
    expect(i18n.t('auth.forgot.sent', { email: 'a@b.co' })).toContain('a@b.co');
  });

  it('switching to Arabic saves it, uses Arabic plural forms and asks for a restart (RTL)', async () => {
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
    await expect(changeLanguage('ar')).resolves.toBe(true);
    expect(currentLanguage()).toBe('ar');
    expect(services().kv.getString('settings.language')).toBe('ar');
    expect(forceRTL).toHaveBeenCalledWith(true);
    expect(i18n.t('offline.pending', { count: 2 })).toContain('تغييرين');
    expect(i18n.t('offline.pending', { count: 5 })).toContain('5 تغييرات');
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

describe('translations', () => {
  const PLURAL = /_(zero|one|two|few|many|other)$/;
  const keys = (tree: object, prefix = ''): string[] =>
    Object.entries(tree).flatMap(([key, value]) =>
      typeof value === 'object' && value !== null
        ? keys(value, `${prefix}${key}.`)
        : [`${prefix}${key}`.replace(PLURAL, '')],
    );

  it('Arabic has every English key (plural forms may differ)', () => {
    const { resources } = jest.requireActual<typeof import('./index')>('./index');
    const arabic = new Set(keys(resources.ar.translation));
    const missing = [...new Set(keys(resources.en.translation))].filter(key => !arabic.has(key));
    expect(missing).toEqual([]);
  });
});

describe('Intl polyfills', () => {
  // Jest runs Node's native Intl; this checks the polyfill Hermes actually uses.
  it('the PluralRules polyfill gives Arabic all six plural forms', () => {
    type Module = typeof Intl.PluralRules & { default?: typeof Intl.PluralRules };
    const module = jest.requireActual<Module>('intl-pluralrules/plural-rules');
    const PluralRules = module.default ?? module;
    const forms = [0, 1, 2, 3, 11, 100].map(n => new PluralRules('ar').select(n));
    expect(forms).toEqual(['zero', 'one', 'two', 'few', 'many', 'other']);
  });

  // Hermes has no Intl.RelativeTimeFormat; without its data a language falls back to English
  // relative times on device, even though Jest (Node's full Intl) still passes.
  it('load relative-time data for every supported language', () => {
    const source = jest
      .requireActual<typeof import('fs')>('fs')
      .readFileSync(require.resolve('@/shared/lib/format'), 'utf8');
    for (const language of Object.keys(LANGUAGES)) {
      expect(source).toContain(`from 'relative-time-format/locale/${language}.json'`);
    }
  });
});
