import type { ReactNode } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

const ThemedKeyboardScroll = withUnistyles(KeyboardAwareScrollView);

export type ScreenProps = {
  children: ReactNode;
  /** Scrolls and keeps the focused input above the keyboard. Use for forms and long content. */
  scroll?: boolean;
  /** Which safe-area edges to pad. A header or tab bar already covers its edge. */
  edges?: Array<'top' | 'bottom'>;
  padded?: boolean;
  testID?: string;
};

/** Page container: theme background, safe-area padding, optional keyboard-aware scrolling. */
export function Screen({
  children,
  scroll,
  edges = ['top', 'bottom'],
  padded = true,
  testID,
}: ScreenProps) {
  const top = edges.includes('top');
  const bottom = edges.includes('bottom');

  if (scroll) {
    return (
      <ThemedKeyboardScroll
        testID={testID}
        style={styles.root}
        contentContainerStyle={styles.content(top, bottom, padded)}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {children}
      </ThemedKeyboardScroll>
    );
  }
  return (
    <View testID={testID} style={[styles.root, styles.content(top, bottom, padded)]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: (top: boolean, bottom: boolean, padded: boolean) => ({
    flexGrow: 1,
    paddingTop: (top ? rt.insets.top : 0) + (padded ? theme.spacing.lg : 0),
    paddingBottom: (bottom ? rt.insets.bottom : 0) + (padded ? theme.spacing.lg : 0),
    paddingHorizontal: padded ? theme.spacing.lg : 0,
    gap: theme.spacing.lg,
    // Comfortable reading width on tablets.
    maxWidth: { xs: undefined, md: 640 },
    width: '100%',
    alignSelf: 'center',
  }),
}));
