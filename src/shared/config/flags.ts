/**
 * Every feature flag and remote setting the app reads, with the value used until Remote Config
 * answers (and always, when Firebase isn't set up). Add new keys here; read them with
 * `services().flags.getBoolean('key', FLAG_DEFAULTS.key)`.
 */
export const FLAG_DEFAULTS = {
  /** Lowest app version allowed to run, e.g. "1.4.0". Older versions see the update screen. */
  min_supported_version: '0.0.0',
  /** Shows the maintenance screen instead of the app. */
  maintenance_mode: false,
  /** The app's App Store id (digits), for the update screen's button on iOS. Empty: no button. */
  ios_app_store_id: '',
} as const satisfies Record<string, string | number | boolean>;

export type FlagKey = keyof typeof FLAG_DEFAULTS;
