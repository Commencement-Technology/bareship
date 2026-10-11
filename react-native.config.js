/**
 * React Native CLI configuration (autolinking overrides).
 *
 * @react-native-firebase/crashlytics adds a "[RNFB] Crashlytics Configuration" build phase that uploads
 * dSYMs on every build and fails when the app has no GoogleService-Info.plist. Firebase is optional in
 * this template (ADR 0010), so that phase is replaced by "[rn-template] Crashlytics symbols"
 * (scripts/ios/configure-environments.rb), which only runs for Release builds that have the plist.
 */
module.exports = {
  dependencies: {
    '@react-native-firebase/crashlytics': {
      platforms: { ios: { scriptPhases: [] } },
    },
  },
};
