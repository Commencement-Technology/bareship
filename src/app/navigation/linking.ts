import { env } from '@/shared/config/env';

/**
 * Deep-link prefixes per environment, e.g. rntemplate-dev://post/p_1.
 * The native URL scheme registration and universal / app links arrive in Phase 3.
 */
const scheme = env.APP_ENV === 'prod' ? 'rntemplate' : `rntemplate-${env.APP_ENV}`;

export const linking = {
  enabled: true as const,
  prefixes: [`${scheme}://`],
};
