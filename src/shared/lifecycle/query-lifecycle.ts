import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Teaches TanStack Query about mobile life cycle:
 * - online/offline from NetInfo: queries pause offline and refetch on reconnect
 * - "focus" = app returning to the foreground: stale queries refetch
 * Returns a cleanup function.
 */
export function setupQueryLifecycle(): () => void {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => setOnline(state.isConnected !== false)),
  );

  const onChange = (status: AppStateStatus) => focusManager.setFocused(status === 'active');
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}
