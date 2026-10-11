import FirebaseCore
import UIKit

// [rn-template] Apps built with the iOS 27 SDK must use the UIScene life cycle, or they are killed at launch.
// The window and React Native start in SceneDelegate.swift (backported from the RN template's main branch).
// See docs/native-changes.md#uiscene.
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  // [rn-template] Libraries written for the app-delegate window still call `appDelegate.window`
  // (React Native Firebase Messaging does at launch, and crashes without it). SceneDelegate assigns
  // the scene's window here. See docs/native-changes.md#uiscene.
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // [rn-template] Firebase is optional (ADR 0010): the "Copy Firebase config" build phase bundles
    // GoogleService-Info.plist only for environments that have one. Without it, Firebase stays off and
    // the app's Firebase adapters fall back to logging. FirebaseApp.configure() would crash instead.
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
      FirebaseApp.configure()
    }
    return true
  }
}
