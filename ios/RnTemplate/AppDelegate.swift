import UIKit

// [rn-template] Apps built with the iOS 27 SDK must use the UIScene life cycle, or they are killed at launch.
// The window and React Native start in SceneDelegate.swift (backported from the RN template's main branch).
// See docs/native-changes.md#uiscene.
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    true
  }
}
