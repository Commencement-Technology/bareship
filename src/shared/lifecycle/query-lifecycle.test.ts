import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { setupQueryLifecycle } from './query-lifecycle';

describe('setupQueryLifecycle', () => {
  it('maps NetInfo to online state and AppState to focus', () => {
    const remove = jest.fn();
    let onAppState: ((status: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      onAppState = handler as (status: string) => void;
      return { remove } as never;
    });
    let onNetInfo: ((state: { isConnected: boolean | null }) => void) | undefined;
    (NetInfo.addEventListener as jest.Mock).mockImplementation(listener => {
      onNetInfo = listener;
      return () => {};
    });

    const cleanup = setupQueryLifecycle();

    onNetInfo?.({ isConnected: false });
    expect(onlineManager.isOnline()).toBe(false);
    onNetInfo?.({ isConnected: true });
    expect(onlineManager.isOnline()).toBe(true);

    onAppState?.('background');
    expect(focusManager.isFocused()).toBe(false);
    onAppState?.('active');
    expect(focusManager.isFocused()).toBe(true);

    cleanup();
    expect(remove).toHaveBeenCalled();
  });
});
