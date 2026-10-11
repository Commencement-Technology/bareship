import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import UIKit

// [rn-template] UIScene life cycle, required by the iOS 27 SDK (docs/native-changes.md#uiscene).
// Mirrors the React Native template's main branch, adapted to RN 0.87 APIs: 0.87 has no scene-aware
// startReactNative or RCTLinkingManager scene helpers, so links are forwarded to the application variants.
class SceneDelegate: RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactory = RCTReactNativeFactory(delegate: self)
    window = UIWindow(windowScene: windowScene)
    // [rn-template] For libraries that read the app delegate's window (see AppDelegate.swift).
    (UIApplication.shared.delegate as? AppDelegate)?.window = window

    reactNativeFactory?.startReactNative(
      withModuleName: "RnTemplate",
      in: window,
      launchOptions: Self.launchOptions(from: connectionOptions)
    )
  }

  // A link that cold-starts the app arrives in connectionOptions. RN 0.87 reads the initial URL from
  // launch options, so translate it into the keys Linking.getInitialURL() understands.
  private static func launchOptions(from options: UIScene.ConnectionOptions) -> [AnyHashable: Any]? {
    if let url = options.urlContexts.first?.url {
      return [UIApplication.LaunchOptionsKey.url: url]
    }
    if let activity = options.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }) {
      return [
        UIApplication.LaunchOptionsKey.userActivityDictionary: [
          "UIApplicationLaunchOptionsUserActivityKey": activity,
          "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType,
        ]
      ]
    }
    return nil
  }

  // Custom-scheme links while the app is running.
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  // Universal links while the app is running.
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(
      UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }

  // [rn-template] Keep the native splash until JS calls BootSplash.hide() (docs/native-changes.md#splash).
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
