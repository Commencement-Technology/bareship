import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { createPersistOptions, queryClient } from '@/data';
import { useSession } from '@/entities/session';
import { services } from '@/shared/services/services';
import { ErrorBoundary, ToastHost } from '@/shared/ui';

import { afterBoot, boot } from './boot';
import { linking } from './navigation/linking';
import { Navigation } from './navigation/RootNavigator';
import { navigationTheme } from './navigation/theme';

const persistOptions = createPersistOptions();

export function App() {
  const { theme } = useUnistyles();
  const [booted, setBooted] = useState(false);
  const [restored, setRestored] = useState(false);
  const status = useSession(state => state.status);

  useEffect(() => {
    boot().finally(() => {
      setBooted(true);
      afterBoot();
    });
  }, []);

  // Keep the native splash until the session and the cached data are back, so the first frame is real.
  const ready = booted && restored && status !== 'unknown';
  useEffect(() => {
    if (ready) BootSplash.hide({ fade: true }).catch(() => {});
  }, [ready]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
          onSuccess={() => setRestored(true)}
          onError={() => setRestored(true)}
        >
          <BottomSheetModalProvider>
            <StatusBar barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'} />
            <ErrorBoundary>
              {booted ? (
                <Navigation
                  theme={navigationTheme(theme)}
                  linking={linking}
                  onStateChange={state => {
                    const route = state?.routes[state.index];
                    if (route) services().analytics.screen(route.name);
                  }}
                />
              ) : null}
            </ErrorBoundary>
            <ToastHost />
          </BottomSheetModalProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create(theme => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
