import { type ComponentRef, type Ref, useId, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';

import { Eye, EyeOff } from '../icons';
import { MIN_TOUCH } from '../theme/tokens';
import { Icon } from './Icon';
import { Text } from './Text';

/** Instance type of TextInput under RN 0.87's strict types (has focus(), blur(), clear()). */
export type TextInputRef = ComponentRef<typeof TextInput>;

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<TextInputRef>;
};

type FieldState = 'idle' | 'focused' | 'error';

/** Labelled text field with hint and error text. Secure fields get a show/hide toggle. */
export function Input({
  label,
  hint,
  error,
  secureTextEntry,
  ref,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  const state: FieldState = error ? 'error' : focused ? 'focused' : 'idle';

  return (
    <View style={styles.container}>
      <Text variant="label" nativeID={`${id}-label`}>
        {label}
      </Text>
      <View style={styles.field(state)}>
        <TextInput
          ref={ref}
          aria-label={label}
          aria-labelledby={`${id}-label`}
          accessibilityHint={error ?? hint}
          aria-invalid={Boolean(error)}
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.primary}
          secureTextEntry={secureTextEntry && !revealed}
          maxFontSizeMultiplier={2}
          style={styles.input}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            role="button"
            aria-label={revealed ? t('common.hidePassword') : t('common.showPassword')}
            onPress={() => setRevealed(value => !value)}
            style={styles.reveal}
            hitSlop={8}
          >
            <Icon icon={revealed ? EyeOff : Eye} tone="textMuted" />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" aria-live="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

// Dynamic functions, not `variants` + useVariants: see the Styling section of AGENTS.md.
const styles = StyleSheet.create(theme => ({
  container: { gap: theme.spacing.xs },
  field: (state: FieldState) => ({
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH + 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    borderColor: {
      idle: theme.colors.border,
      focused: theme.colors.primary,
      error: theme.colors.danger,
    }[state],
  }),
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    ...theme.typography.body,
    textAlign: 'auto',
  },
  reveal: { paddingHorizontal: theme.spacing.md, minHeight: MIN_TOUCH, justifyContent: 'center' },
}));
