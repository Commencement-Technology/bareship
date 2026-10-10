import type { ParseKeys } from 'i18next';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import type { LucideIcon } from '@/shared/ui/icons';

/** Header titles and tab labels that update when the language changes. */
export function TranslatedText({
  i18nKey,
  color,
  small,
}: {
  i18nKey: ParseKeys;
  color?: string;
  small?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      style={[small ? styles.small : styles.title, color ? { color } : null]}
    >
      {t(i18nKey)}
    </Text>
  );
}

export function TabIcon({
  icon: Glyph,
  color,
  size,
}: {
  icon: LucideIcon;
  color: string;
  size: number;
}) {
  return <Glyph color={color} size={size - 2} />;
}

// Header titles get no color from React Navigation, so default to the theme's text color (dark mode).
const styles = StyleSheet.create(theme => ({
  title: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  small: { fontSize: 11, fontWeight: '500', color: theme.colors.text },
}));
