import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { AppTheme } from '../theme/themes';
import type { TypographyVariant } from '../theme/tokens';

export type TextTone =
  'default' | 'muted' | 'subtle' | 'primary' | 'onPrimary' | 'danger' | 'success';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: 'auto' | 'center' | 'left' | 'right' | 'justify';
};

const HEADINGS: ReadonlySet<TypographyVariant> = new Set(['display', 'title', 'heading']);

const TONE_COLOR: Record<TextTone, keyof AppTheme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  onPrimary: 'onPrimary',
  danger: 'danger',
  success: 'success',
};

/** All text in the app. Headings get the accessibility "header" role; scaling is capped at 2×. */
export function Text({
  variant = 'body',
  tone = 'default',
  align,
  style,
  accessibilityRole,
  maxFontSizeMultiplier = 2,
  ...rest
}: TextProps) {
  return (
    <RNText
      accessibilityRole={accessibilityRole ?? (HEADINGS.has(variant) ? 'header' : undefined)}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[styles.text(variant, tone), align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}

// Dynamic functions, not `variants` + useVariants: see the Styling section of AGENTS.md.
const styles = StyleSheet.create(theme => ({
  text: (variant: TypographyVariant, tone: TextTone) => ({
    writingDirection: 'auto',
    ...theme.typography[variant],
    color: theme.colors[TONE_COLOR[tone]],
  }),
}));
