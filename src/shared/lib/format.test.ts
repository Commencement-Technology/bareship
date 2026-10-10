import { initI18n } from '@/shared/i18n';

import { formatDate, formatNumber, formatRelative } from './format';

describe('format', () => {
  beforeAll(() => {
    initI18n('en');
  });

  it('formats relative times', () => {
    const now = Date.parse('2026-10-10T12:00:00Z');
    expect(formatRelative('2026-10-10T11:57:00Z', now)).toBe('3 minutes ago');
    expect(formatRelative('2026-10-08T12:00:00Z', now)).toBe('2 days ago');
    expect(formatRelative('2026-10-10T11:59:50Z', now)).toBe('10 seconds ago');
  });

  it('formats numbers and dates for the current language', () => {
    expect(formatNumber(12345.6)).toBe('12,345.6');
    expect(
      formatDate('2026-10-10T12:00:00Z', { year: 'numeric', month: 'long', timeZone: 'UTC' }),
    ).toBe('October 2026');
  });
});
