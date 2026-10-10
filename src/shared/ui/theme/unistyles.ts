import { StyleSheet } from 'react-native-unistyles';

import { getThemePreference } from './preference';
import { themes } from './themes';
import { breakpoints } from './tokens';

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

/**
 * Must run before any StyleSheet.create: index.js imports this file first.
 * "system" follows the OS (adaptive themes); an explicit choice pins the theme.
 */
const preference = getThemePreference();

StyleSheet.configure({
  themes,
  breakpoints,
  settings: preference === 'system' ? { adaptiveThemes: true } : { initialTheme: preference },
});
