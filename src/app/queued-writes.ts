/**
 * Registers every queued write (`defineQueuedMutation`, ADR 0006) before the saved query cache is
 * restored, so writes queued before the app was closed can replay. Metro loads modules lazily
 * (inlineRequires), so a feature's module may not have run yet when the cache comes back.
 *
 * Add one import per module that calls `defineQueuedMutation`. A test fails if one is missing.
 */
// Side-effect imports of the defining module, not the feature API: that would load the screens at boot.
// @example-start:queued-writes-empty
/* eslint-disable no-restricted-imports */
import '@/features/feed/api';
// @example-end
