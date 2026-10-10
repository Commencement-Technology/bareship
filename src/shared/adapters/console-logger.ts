import type { LogContext, Logger } from '@/shared/ports';

const LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LEVELS)[number];

/** Logger that writes to the JS console at or above `minLevel`. Redacts obvious secrets. */
export function createConsoleLogger(minLevel: LogLevel = 'info'): Logger {
  const threshold = LEVELS.indexOf(minLevel);
  const emit = (level: LogLevel, message: string, context?: LogContext) => {
    if (LEVELS.indexOf(level) < threshold) return;
    const args: unknown[] = [`[${level}] ${message}`];
    if (context) args.push(redact(context));
    console[level === 'debug' ? 'log' : level](...args);
  };
  return {
    debug: (m, c) => emit('debug', m, c),
    info: (m, c) => emit('info', m, c),
    warn: (m, c) => emit('warn', m, c),
    error: (m, c) => emit('error', m, c),
  };
}

const SECRET_KEY = /token|password|secret|authorization|cookie/i;

export function redact(context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      SECRET_KEY.test(key) ? '[redacted]' : value,
    ]),
  );
}
