import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { i18n } from '@/shared/i18n';
import { services } from '@/shared/services/services';

import { Button } from './primitives/Button';
import { Text } from './primitives/Text';

type Props = { children: ReactNode; fallback?: (reset: () => void) => ReactNode };
type State = { error: Error | null };

/** Reports render errors to the crash reporter and offers a way back instead of a blank screen. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    services().crash.recordError(error, { componentStack: info.componentStack ?? undefined });
  }

  reset = () => this.setState({ error: null });

  override render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);
    return (
      <View style={styles.container} testID="error-screen">
        <Text variant="title" align="center">
          {i18n.t('errorScreen.title')}
        </Text>
        <Text tone="muted" align="center">
          {i18n.t('errorScreen.body')}
        </Text>
        <Button title={i18n.t('errorScreen.action')} onPress={this.reset} />
      </View>
    );
  }
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    paddingTop: rt.insets.top + theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
}));
