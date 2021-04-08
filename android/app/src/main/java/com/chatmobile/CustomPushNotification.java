package com.chatmobile;

import android.content.Context;
import android.os.Bundle;

import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.PushNotification;

public class CustomPushNotification extends PushNotification {
    protected CustomPushNotification(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper JsIOHelper) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, JsIOHelper);
    }
}
