import { Platform } from 'react-native';

/**
 * Where the update screen sends people. Android opens the Play Store page for the installed
 * application id; iOS needs the App Store id from Remote Config (`ios_app_store_id`), so it returns
 * null until the app is published.
 */
export function storeUrls(
  bundleId: string,
  iosAppStoreId: string,
): { app: string; web: string } | null {
  if (Platform.OS === 'android') {
    return {
      app: `market://details?id=${bundleId}`,
      web: `https://play.google.com/store/apps/details?id=${bundleId}`,
    };
  }
  if (!/^\d+$/.test(iosAppStoreId)) return null;
  return {
    app: `itms-apps://apps.apple.com/app/id${iosAppStoreId}`,
    web: `https://apps.apple.com/app/id${iosAppStoreId}`,
  };
}
