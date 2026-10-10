import type { AxiosAdapter } from 'axios';

import { refreshTokens, useSession } from '@/entities/session';
import { configureHttp, sessionTokens } from '@/shared/api';
import { env } from '@/shared/config/env';
import { currentLanguage, initI18n } from '@/shared/i18n';
import { setupQueryLifecycle } from '@/shared/lifecycle/query-lifecycle';
import { services } from '@/shared/services/services';

let booted: Promise<void> | undefined;

/**
 * Everything that must happen before the first screen, in order. Runs once.
 * Keep it fast and offline-safe: it never waits on the network.
 */
export function boot(): Promise<void> {
  booted ??= (async () => {
    const { logger } = services();

    // First, so any screen (including the error screen) can render translated text.
    initI18n();

    let adapter: AxiosAdapter | undefined;
    if (__DEV__ && env.API_MOCKS) {
      // Development-only mock backend (src/mocks). Required lazily so release code paths never run it.
      try {
        const { startMocks } = require('@/mocks/native') as typeof import('@/mocks/native');
        adapter = startMocks();
      } catch (error) {
        logger.error('Mock backend failed to start; requests will go to API_URL', {
          error: String(error),
        });
      }
    }

    configureHttp({
      baseURL: env.API_URL,
      tokens: sessionTokens(),
      logger,
      refreshTokens,
      onSessionExpired: () => {
        useSession.getState().signOut('expired');
      },
      getLanguage: currentLanguage,
      adapter,
    });

    setupQueryLifecycle();
    await useSession.getState().hydrate();
  })().catch(error => {
    // Never leave the app on the splash: a failed boot still decides the session (signed out).
    services().crash.recordError(error, { phase: 'boot' });
    if (useSession.getState().status === 'unknown')
      useSession.setState({ status: 'signedOut', user: null });
  });
  return booted;
}

/** Background work after the first screen is ready. */
export function afterBoot(): void {
  const { flags, logger } = services();
  flags
    .refresh()
    .catch(error => logger.warn('Feature flags refresh failed', { error: String(error) }));
}
