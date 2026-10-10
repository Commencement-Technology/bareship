import { useUnistyles } from 'react-native-unistyles';

import type { LucideIcon } from '../icons';
import type { AppTheme } from '../theme/themes';

export type IconTone = keyof Pick<
  AppTheme['colors'],
  'text' | 'textMuted' | 'textSubtle' | 'primary' | 'onPrimary' | 'danger' | 'success'
>;

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  tone?: IconTone;
  /** Mirror in right-to-left layouts (arrows, chevrons). */
  directional?: boolean;
  /** Icons are decorative by default; give a label only when the icon is the only content. */
  accessibilityLabel?: string;
};

/** Lucide icon in a theme color. */
export function Icon({
  icon: Glyph,
  size = 20,
  tone = 'text',
  directional,
  accessibilityLabel,
}: IconProps) {
  const { theme, rt } = useUnistyles();
  return (
    <Glyph
      size={size}
      color={theme.colors[tone]}
      strokeWidth={2}
      style={directional && rt.rtl ? { transform: [{ scaleX: -1 }] } : undefined}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}
