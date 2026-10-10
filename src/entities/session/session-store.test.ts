import { queryClient } from '@/data/query-client';
import { sessionTokens } from '@/shared/api';
import { services } from '@/shared/services/services';
import { signInDemoUser } from '@/test/app';

import { useSession } from './session-store';

describe('useSession', () => {
  it('hydrates to signedOut when nothing is stored', async () => {
    useSession.setState({ status: 'unknown' });
    await useSession.getState().hydrate();
    expect(useSession.getState().status).toBe('signedOut');
  });

  it('signs in, then restores the session on the next launch without the network', async () => {
    await signInDemoUser();
    expect(useSession.getState()).toMatchObject({
      status: 'signedIn',
      user: { email: 'demo@example.com' },
    });

    useSession.setState({ status: 'unknown', user: null });
    await useSession.getState().hydrate();
    expect(useSession.getState()).toMatchObject({
      status: 'signedIn',
      user: { name: 'Demo User' },
    });
  });

  it('signing out clears tokens, the cached user and every query', async () => {
    await signInDemoUser();
    queryClient.setQueryData(['posts', 'feed'], { pages: [] });

    await useSession.getState().signOut();

    expect(useSession.getState().status).toBe('signedOut');
    await expect(sessionTokens().get()).resolves.toBeNull();
    expect(services().kv.getString('session.user')).toBeUndefined();
    expect(queryClient.getQueryData(['posts', 'feed'])).toBeUndefined();
  });

  it('ignores a corrupt cached user', async () => {
    await sessionTokens().set({ accessToken: 'a', refreshToken: 'r' });
    services().kv.set('session.user', '{"id":1}');
    await useSession.getState().hydrate();
    expect(useSession.getState().status).toBe('signedOut');
  });
});
