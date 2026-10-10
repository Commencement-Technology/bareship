import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import type { AppTheme } from '@/shared/ui';

/** React Navigation theme derived from the app theme, so headers and tab bars match. */
export function navigationTheme(theme: AppTheme): Theme {
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}
