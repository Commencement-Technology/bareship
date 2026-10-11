import { http as mock, HttpResponse } from 'msw';

import { server } from '@/mocks/node';
import type { Push } from '@/shared/ports';
import { setServices } from '@/shared/services/services';
import { signInDemoUser } from '@/test/app';

import { setupPushRegistration } from './push-registration';

function fakePush(token: string | null) {
  let tokenListener: ((token: string) => void) | undefined;
  const push: Push = {
    permission: async () => 'granted',
    requestPermission: async () => 'granted',
    getToken: async () => token,
    onTokenChange: listener => {
      tokenListener = listener;
      return () => {};
    },
    initialOpen: async () => null,
    onOpen: () => () => {},
    showLocal: async () => {},
  };
  return { push, changeToken: (next: string) => tokenListener?.(next) };
}

function captureDevices() {
  const sent: unknown[] = [];
  server.use(
    mock.post('*/devices', async ({ request }) => {
      sent.push(await request.json());
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return sent;
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('push token registration', () => {
  it('sends the token after sign-in and again when it changes', async () => {
    const sent = captureDevices();
    const { push, changeToken } = fakePush('token-1');
    setServices({ push });
    const stop = setupPushRegistration();

    await signInDemoUser();
    await settle();
    expect(sent).toEqual([{ token: 'token-1', platform: 'ios' }]);

    changeToken('token-2');
    await settle();
    expect(sent).toEqual([
      { token: 'token-1', platform: 'ios' },
      { token: 'token-2', platform: 'ios' },
    ]);
    stop();
  });

  it('sends nothing without a token (no Firebase or no permission)', async () => {
    const sent = captureDevices();
    setServices({ push: fakePush(null).push });
    const stop = setupPushRegistration();
    await signInDemoUser();
    await settle();
    expect(sent).toEqual([]);
    stop();
  });
});
