/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <SafariServices/SafariServices.h>
#import <AuthenticationServices/AuthenticationServices.h>
#if __has_include(<FBSDKCoreKit/FBSDKCoreKit.h>)
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#endif
#if __has_include(<FBSDKCoreKit/FBSDKCoreKit-Swift.h>)
#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>
#endif
#import <Firebase.h>
#import <IntercomModule.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <RNGoogleSignin/RNGoogleSignin.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

#import <UserNotifications/UserNotifications.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@interface AppDelegate ()
@property (nonatomic, strong) RCTAppDependencyProvider *appDependencyProvider;
@end

@implementation AppDelegate

- (instancetype)init
{
  if (self = [super init]) {
    _appDependencyProvider = [RCTAppDependencyProvider new];
    self.dependencyProvider = _appDependencyProvider;
  }
  return self;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif
  
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

#if __has_include(<FBSDKCoreKit/FBSDKCoreKit.h>) || __has_include(<FBSDKCoreKit/FBSDKCoreKit-Swift.h>)
  if ([FBSDKApplicationDelegate class]) {
    [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
  }
#endif

  [IntercomModule initialize:@"ios_sdk-5771d37f817d4a7c25ae4d10983ae6774f415124" withAppId:@"xiivsyz8"];

  UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
  notificationCenter.delegate = self;

  self.moduleName = @"kyte";
  self.initialProps = @{};

  BOOL didFinish = [super application:application didFinishLaunchingWithOptions:launchOptions];

  if (@available(iOS 13, *)) {
    self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }

  return didFinish;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  NSString *fbScheme = [NSString stringWithFormat:@"fb%@", @"187826571838563"];
  if ([[url scheme] hasPrefix:fbScheme]) {
#if __has_include(<FBSDKCoreKit/FBSDKCoreKit.h>) || __has_include(<FBSDKCoreKit/FBSDKCoreKit-Swift.h>)
    if ([FBSDKApplicationDelegate class]) {
      return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options];
    }
#endif
    // If FBSDK is not available, fall through to other handlers
  }

  return [RNGoogleSignin application:application openURL:url options:options] ||
    [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [IntercomModule setDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  completionHandler(UIBackgroundFetchResultNoData);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  completionHandler();
}

- (NSURL *)bundleURL
{
#ifdef DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (BOOL)turboModuleEnabled
{
  return YES;
}

- (BOOL)fabricEnabled
{
  return YES;
}

@end
