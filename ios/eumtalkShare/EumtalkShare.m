#import <Foundation/Foundation.h>
#import "ReactNativeShareExtension.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLog.h>
@import Firebase;

@interface EumtalkShare : ReactNativeShareExtension
@end

@implementation EumtalkShare

RCT_EXPORT_MODULE();

- (UIView*) shareView {
  NSURL *jsCodeLocation;
  [FIRApp configure];


 #if DEBUG
   jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"app/index" fallbackResource:nil];
 #else
   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
 #endif
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"EumtalkShare"
                                               initialProperties:nil
                                                   launchOptions:nil];
  
  rootView.backgroundColor = nil;

  // Uncomment for console output in Xcode console for release mode on device:
  // RCTSetLogThreshold(RCTLogLevelInfo - 1);

  return rootView;
}

@end
