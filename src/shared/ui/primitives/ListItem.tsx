import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChevronRight, type LucideIcon } from '../icons';
import { MIN_TOUCH } from '../theme/tokens';
import { Icon, type IconTone } from './Icon';
import { Text, type TextTone } from './Text';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Value or control shown at the end of the row. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Show a chevron for rows that navigate. */
  chevron?: boolean;
  tone?: 'default' | 'danger';
  testID?: string;
};

export function ListItem({
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  chevron,
  tone = 'default',
  testID,
}: ListItemProps) {
  const textTone: TextTone = tone === 'danger' ? 'danger' : 'default';
  const iconTone: IconTone = tone === 'danger' ? 'danger' : 'textMuted';
  const content = (
    <>
      {icon ? <Icon icon={icon} tone={iconTone} /> : null}
      <View style={styles.text}>
        <Text tone={textTone}>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? <Icon icon={ChevronRight} tone="textSubtle" directional /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={styles.row}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: MIN_TOUCH + 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  text: { flex: 1, gap: theme.spacing.xxs },
  pressed: { backgroundColor: theme.colors.surfaceMuted },
}));
