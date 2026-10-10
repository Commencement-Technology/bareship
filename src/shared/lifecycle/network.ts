import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange);
const isOnline = () => onlineManager.isOnline();

/**
 * True while the device has a connection. Reads TanStack Query's onlineManager, which
 * setupQueryLifecycle() feeds from NetInfo, so the UI and the offline queue always agree.
 */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, isOnline, isOnline);
}
