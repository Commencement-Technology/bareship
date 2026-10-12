import { Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '../primitives/Text';
import { type ToastTone, useToastStore } from './toast-store';

/** Mount once near the root. */
export function ToastHost() {
  const current = useToastStore(state => state.current);
  const dismiss = useToastStore(state => state.dismiss);
  if (!current) return null;
  return (
    <Animated.View
      key={current.id}
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={styles.wrapper}
      pointerEvents="box-none"
    >
      <Pressable
        role="alert"
        aria-live="assertive"
        onPress={dismiss}
        style={styles.toast(current.tone)}
        testID="toast"
      >
        <Text variant="label" tone="onPrimary">
          {current.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Dynamic functions, not `variants` + useVariants: see the Styling section of AGENTS.md.
const styles = StyleSheet.create((theme, rt) => ({
  wrapper: {
    position: 'absolute',
    start: theme.spacing.lg,
    end: theme.spacing.lg,
    bottom: rt.insets.bottom + theme.spacing.xxxl + theme.spacing.xl,
    alignItems: 'center',
  },
  toast: (tone: ToastTone) => ({
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    maxWidth: 520,
    backgroundColor: {
      info: theme.colors.text,
      success: theme.colors.success,
      danger: theme.colors.danger,
    }[tone],
  }),
}));
