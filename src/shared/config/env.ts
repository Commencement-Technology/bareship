import Config from 'react-native-config';
import { z } from 'zod';

/**
 * The only module that reads build-time configuration.
 * Values come from .env.<environment> via react-native-config and are public:
 * never put secrets in them. See docs/decisions/0004-environments-and-config.md.
 */
const EnvSchema = z.object({
  APP_ENV: z.enum(['dev', 'staging', 'prod']),
  API_URL: z.url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map(issue => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid app configuration. Check .env.<environment> for these keys:\n${problems}`,
    );
  }
  return result.data;
}

export const env: Env = parseEnv(Config);

export const isProd = env.APP_ENV === 'prod';

export { parseEnv };
