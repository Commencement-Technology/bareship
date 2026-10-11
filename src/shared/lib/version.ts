/**
 * Compares dotted version strings by their numeric parts: "1.10.0" is newer than "1.9.2", "1.4" equals
 * "1.4.0". Anything after a part's digits is ignored, so Android's "1.4.0-dev" compares as 1.4.0.
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const parse = (version: string) => version.split('.').map(part => parseInt(part, 10) || 0);
  const left = parse(a);
  const right = parse(b);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}
