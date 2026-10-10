import { UnistylesRuntime } from 'react-native-unistyles';

import { services } from '@/shared/services/services';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'settings.theme';

export function getThemePreference(): ThemePreference {
  const value = services().kv.getString(KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

/** Saves the choice and applies it immediately, without re-rendering the tree (Unistyles 3). */
export function setThemePreference(preference: ThemePreference): void {
  services().kv.set(KEY, preference);
  if (preference === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(preference);
  }
}
