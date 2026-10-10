import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { LucideIcon } from '../icons';
import { MIN_TOUCH } from '../theme/tokens';
import { Icon, type IconTone } from './Icon';
import { Text, type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
};

const TONE: Record<ButtonVariant, { text: TextTone; icon: IconTone }> = {
  primary: { text: 'onPrimary', icon: 'onPrimary' },
  secondary: { text: 'default', icon: 'text' },
  ghost: { text: 'primary', icon: 'primary' },
  danger: { text: 'onPrimary', icon: 'onPrimary' },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  fullWidth,
  ...rest
}: ButtonProps) {
  const { theme } = useUnistyles();
  const inactive = Boolean(disabled) || loading;
  const tone = TONE[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={size === 'sm' ? 8 : undefined}
      style={({ pressed }) => [
        styles.button(variant, size),
        fullWidth && styles.fullWidth,
        pressed && !inactive && styles.pressed,
        inactive && styles.inactive,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors[tone.icon]} />
      ) : (
        <>
          {icon ? <Icon icon={icon} tone={tone.icon} size={size === 'lg' ? 20 : 18} /> : null}
          <Text variant="label" tone={tone.text} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// Dynamic functions, not `variants` + useVariants: see the Styling section of AGENTS.md.
const styles = StyleSheet.create(theme => ({
  button: (variant: ButtonVariant, size: ButtonSize) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    ...{
      primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
      secondary: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
      danger: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
    }[variant],
    ...{
      sm: { minHeight: 36, paddingHorizontal: theme.spacing.md },
      md: { minHeight: MIN_TOUCH, paddingHorizontal: theme.spacing.lg },
      lg: { minHeight: 52, paddingHorizontal: theme.spacing.xl },
    }[size],
  }),
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.82 },
  inactive: { opacity: 0.5 },
}));
