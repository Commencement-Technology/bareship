import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { env } from '@/shared/config/env';

/**
 * Phase 1 shell: proves the environment wiring end to end.
 * Replaced by the navigation tree and providers in Phase 2.
 */
export function App() {
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    // Hide the native splash once the first frame is ready.
    BootSplash.hide({ fade: true }).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.root, isDark && styles.rootDark]}>
        <View style={styles.card} accessibilityRole="summary">
          <Text style={[styles.label, isDark && styles.textDark]}>Environment</Text>
          <Text testID="env-name" style={[styles.value, isDark && styles.textDark]}>
            {env.APP_ENV}
          </Text>
          <Text style={[styles.label, isDark && styles.textDark]}>API</Text>
          <Text style={[styles.mono, isDark && styles.textDark]}>{env.API_URL}</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F5F8' },
  rootDark: { backgroundColor: '#0E131A' },
  card: { gap: 6, padding: 24 },
  label: { fontSize: 13, color: '#536071', textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 32, fontWeight: '700', color: '#121923', marginBottom: 12 },
  mono: { fontSize: 14, fontFamily: 'Menlo', color: '#121923' },
  textDark: { color: '#E5EAF0' },
});
