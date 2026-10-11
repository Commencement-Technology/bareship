import { getApps } from '@react-native-firebase/app';

/**
 * True when the native app started Firebase: the build bundled google-services.json (Android) or
 * GoogleService-Info.plist (iOS) for this environment. See docs/going-live.md.
 */
export function isFirebaseConfigured(): boolean {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}
