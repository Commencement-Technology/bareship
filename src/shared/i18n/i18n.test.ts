import { I18nManager } from 'react-native';

import { services } from '@/shared/services/services';

import {
  applyDirection,
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
    services().kv.set('settings.language', 'hi');
    expect(resolveInitialLanguage()).toBe('hi');
  });

  it('translates with interpolation and English plurals', () => {
    expect(i18n.t('offline.pending', { count: 1 })).toContain('1 change will sync');
    expect(i18n.t('offline.pending', { count: 3 })).toContain('3 changes will sync');
    expect(i18n.t('auth.forgot.sent', { email: 'a@b.co' })).toContain('a@b.co');
  });

  it('switching to Hindi saves it, uses Hindi plural forms and needs no restart', async () => {
    const forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
    await expect(changeLanguage('hi')).resolves.toBe(false);
    expect(currentLanguage()).toBe('hi');
    expect(services().kv.getString('settings.language')).toBe('hi');
    expect(forceRTL).toHaveBeenCalledWith(false);
    expect(i18n.t('offline.pending', { count: 1 })).toContain(
      'बदलाव कनेक्शन वापस आने पर सिंक होगा',
    );
    expect(i18n.t('offline.pending', { count: 5 })).toContain(
      '5 बदलाव कनेक्शन वापस आने पर सिंक होंगे',
    );
    await changeLanguage('en');
    forceRTL.mockRestore();
  });
});

// The app ships no right-to-left language, but adding one is a single `rtl: true` (ADR 0017). These
// tests keep the switch working: they drive it with the flag, as an RTL entry in LANGUAGES would.
describe('layout direction', () => {
  let allowRTL: jest.SpyInstance;
  let forceRTL: jest.SpyInstance;
  beforeEach(() => {
    allowRTL = jest.spyOn(I18nManager, 'allowRTL').mockImplementation(() => {});
    forceRTL = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});
  });
  afterEach(() => {
    allowRTL.mockRestore();
    forceRTL.mockRestore();
  });

  it('turning right-to-left on from a left-to-right launch asks for a restart', () => {
    expect(I18nManager.isRTL).toBe(false);
    expect(applyDirection(true)).toBe(true);
    expect(allowRTL).toHaveBeenCalledWith(true);
    expect(forceRTL).toHaveBeenCalledWith(true);
  });

  it('switching to right-to-left and back before restarting leaves the saved direction LTR', () => {
    expect(applyDirection(true)).toBe(true); // restart needed
    expect(applyDirection(false)).toBe(false); // back to the launch direction
    expect(forceRTL).toHaveBeenLastCalledWith(false);
  });

  it('every shipped language declares its direction', () => {
    for (const info of Object.values(LANGUAGES)) expect(typeof info.rtl).toBe('boolean');
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

  it.each(Object.keys(LANGUAGES).filter(language => language !== 'en'))(
    '%s has every English key (plural forms may differ)',
    language => {
      const { resources } = jest.requireActual<typeof import('./index')>('./index');
      const translated = new Set(keys(resources[language as keyof typeof resources].translation));
      const missing = [...new Set(keys(resources.en.translation))].filter(
        key => !translated.has(key),
      );
      expect(missing).toEqual([]);
    },
  );
});

describe('Intl polyfills', () => {
  // Jest runs Node's native Intl; this checks the polyfill Hermes actually uses.
  const pluralRules = () => {
    type Module = typeof Intl.PluralRules & { default?: typeof Intl.PluralRules };
    const module = jest.requireActual<Module>('intl-pluralrules/plural-rules');
    return module.default ?? module;
  };

  it('the PluralRules polyfill gives Hindi its forms (0 and 1 are "one")', () => {
    const PluralRules = pluralRules();
    expect([0, 1, 2, 5].map(n => new PluralRules('hi').select(n))).toEqual([
      'one',
      'one',
      'other',
      'other',
    ]);
  });

  // Covers every CLDR language, so an added language such as Arabic gets all six forms.
  it('the PluralRules polyfill gives Arabic all six plural forms', () => {
    const PluralRules = pluralRules();
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
