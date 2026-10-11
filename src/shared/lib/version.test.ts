import { compareVersions } from './version';

describe('compareVersions', () => {
  it.each([
    ['1.10.0', '1.9.2', 1],
    ['1.4', '1.4.0', 0],
    ['1.4.0-dev', '1.4.0', 0],
    ['2.0.0', '10.0.0', -1],
    ['0.0.0', '0.0.1', -1],
    ['unknown', '0.0.0', 0],
  ] as const)('%s vs %s → %i', (a, b, expected) => {
    expect(compareVersions(a, b)).toBe(expected);
  });
});
