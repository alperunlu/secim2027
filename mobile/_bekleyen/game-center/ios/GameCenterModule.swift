import ExpoModulesCore
import GameKit
import UIKit

/* Oyun WebView içinden {type:'gc'} mesajı gönderir; App.js bu modüle iletir.
   Oturum açılmadıysa başarım ve skor çağrıları sessizce false döner. */
public class GameCenterModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GameCenter")

    AsyncFunction("signIn") { (promise: Promise) in
      let player = GKLocalPlayer.local
      if player.isAuthenticated {
        promise.resolve(true)
        return
      }
      // authenticateHandler birden çok kez çağrılabilir; söz yalnız bir kez çözülür.
      var settled = false
      player.authenticateHandler = { viewController, _ in
        if let viewController = viewController {
          GameCenterModule.topViewController()?.present(viewController, animated: true)
          return
        }
        if settled {
          return
        }
        settled = true
        promise.resolve(GKLocalPlayer.local.isAuthenticated)
      }
    }.runOnQueue(.main)

    AsyncFunction("reportAchievement") { (identifier: String, percent: Double, promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.resolve(false)
        return
      }
      let achievement = GKAchievement(identifier: identifier)
      achievement.percentComplete = min(max(percent, 0), 100)
      achievement.showsCompletionBanner = true
      GKAchievement.report([achievement]) { error in
        promise.resolve(error == nil)
      }
    }

    AsyncFunction("submitScore") { (leaderboardId: String, value: Int, promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else {
        promise.resolve(false)
        return
      }
      GKLeaderboard.submitScore(
        value,
        context: 0,
        player: GKLocalPlayer.local,
        leaderboardIDs: [leaderboardId]
      ) { error in
        promise.resolve(error == nil)
      }
    }
  }

  private static func topViewController() -> UIViewController? {
    let window = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }
    var top = window?.rootViewController
    while let presented = top?.presentedViewController {
      top = presented
    }
    return top
  }
}
