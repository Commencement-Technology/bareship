import DeviceInfo from 'react-native-device-info';

import type { AppInfo } from '@/shared/ports';

export function createDeviceAppInfo(): AppInfo {
  return {
    version: () => DeviceInfo.getVersion(),
    buildNumber: () => DeviceInfo.getBuildNumber(),
    bundleId: () => DeviceInfo.getBundleId(),
  };
}
