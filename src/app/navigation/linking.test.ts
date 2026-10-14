import { Linking } from 'react-native';

import type { Push, PushMessage } from '@/shared/ports';
import { setServices } from '@/shared/services/services';

import { linking } from './linking';

function pushWith(initial: PushMessage | null) {
  let open: ((message: PushMessage) => void) | undefined;
  const push = {
    initialOpen: async () => initial,
    onOpen: (listener: (message: PushMessage) => void) => {
      open = listener;
      return () => {
        open = undefined;
      };
    },
  } as Partial<Push> as Push;
  setServices({ push });
  return { tap: (message: PushMessage) => open?.(message) };
}

describe('linking', () => {
  it('uses the scheme from the environment, with Home under deeper screens', () => {
    expect(linking.prefixes).toEqual(['bareshipapp-dev://']);
    expect(linking.config.initialRouteName).toBe('Main');
  });

  it('opens the link of the notification that launched the app', async () => {
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
    pushWith({ data: { link: 'bareshipapp-dev://post/p_2' } });
    await expect(linking.getInitialURL()).resolves.toBe('bareshipapp-dev://post/p_2');
  });

  it('prefers a URL launch over a notification', async () => {
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue('bareshipapp-dev://post/p_1');
    pushWith({ data: { link: 'bareshipapp-dev://post/p_2' } });
    await expect(linking.getInitialURL()).resolves.toBe('bareshipapp-dev://post/p_1');
  });

  it('forwards taps with a link and stops on cleanup', () => {
    const { tap } = pushWith(null);
    const listener = jest.fn();
    const stop = linking.subscribe(listener);

    tap({ data: {} });
    tap({ data: { link: 'bareshipapp-dev://post/p_3' } });
    stop();
    tap({ data: { link: 'bareshipapp-dev://post/p_4' } });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('bareshipapp-dev://post/p_3');
  });
});
