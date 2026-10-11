import notifee, { AuthorizationStatus, EventType } from 'react-native-notify-kit';

import { createNotifyKitPush, DEFAULT_CHANNEL_ID } from './notify-kit-push';

const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const mocked = notifee as jest.Mocked<typeof notifee>;

describe('notify-kit push adapter', () => {
  it.each([
    [AuthorizationStatus.AUTHORIZED, 'granted'],
    [AuthorizationStatus.PROVISIONAL, 'granted'],
    [AuthorizationStatus.DENIED, 'denied'],
    [AuthorizationStatus.NOT_DETERMINED, 'not-determined'],
  ])('maps permission status %i to %s', async (authorizationStatus, expected) => {
    mocked.getNotificationSettings.mockResolvedValueOnce({ authorizationStatus } as never);
    await expect(createNotifyKitPush(logger).permission()).resolves.toBe(expected);
  });

  it('shows notifications on one Android channel, keeping the data for the tap', async () => {
    const push = createNotifyKitPush(logger);
    await push.showLocal({ title: 'Hi', body: 'There', data: { link: 'myapp://post/1' } });
    await push.showLocal({ title: 'Again', data: {} });

    expect(mocked.createChannel).toHaveBeenCalledTimes(1);
    expect(mocked.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: DEFAULT_CHANNEL_ID }),
    );
    expect(mocked.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hi', data: { link: 'myapp://post/1' } }),
    );
  });

  it('reports taps (not dismissals) as opens', () => {
    const listener = jest.fn();
    createNotifyKitPush(logger).onOpen(listener);
    const observer = mocked.onForegroundEvent.mock.calls.at(-1)?.[0];
    const notification = { title: 'Hi', data: { link: 'myapp://post/1', count: 2 } };

    observer?.({ type: EventType.DISMISSED, detail: { notification } });
    observer?.({ type: EventType.PRESS, detail: { notification } });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      title: 'Hi',
      body: undefined,
      data: { link: 'myapp://post/1', count: '2' },
    });
  });

  it('reports the launching tap once per launch', async () => {
    mocked.getInitialNotification.mockResolvedValue({
      notification: { title: 'Launch', data: { link: 'myapp://post/1' } },
      pressAction: { id: 'default' },
    } as never);
    const push = createNotifyKitPush(logger);
    await expect(push.initialOpen()).resolves.toMatchObject({ data: { link: 'myapp://post/1' } });
    await expect(push.initialOpen()).resolves.toBeNull();
  });

  it('has no push token without Firebase', async () => {
    await expect(createNotifyKitPush(logger).getToken()).resolves.toBeNull();
  });
});
