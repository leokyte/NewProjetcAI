package com.kyte

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.preference.PreferenceManager
import android.util.Log
import androidx.multidex.MultiDexApplication
import cl.json.ShareApplication
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.intercom.reactnative.IntercomModule
import com.google.firebase.FirebaseApp

class MainApplication : MultiDexApplication(), ShareApplication, ReactApplication {

  private fun createPackageList(): MutableList<ReactPackage> =
      PackageList(this).packages

  override val reactNativeHost: ReactNativeHost by lazy {
    object : DefaultReactNativeHost(this) {
      override fun getPackages(): List<ReactPackage> = createPackageList()

      override fun getUseDeveloperSupport(): Boolean =
          BuildConfig.DEBUG || BuildConfig.BUILD_TYPE.equals("relDev", ignoreCase = true)

      override fun getJSMainModuleName(): String = "index"

      override val isNewArchEnabled: Boolean
        get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    }
  }

  override val reactHost: ReactHost by lazy { getDefaultReactHost(applicationContext, reactNativeHost, null) }

  override fun onCreate() {
    super.onCreate()
    logBoot("Application onCreate start (buildType=${BuildConfig.BUILD_TYPE}, flavor=${BuildConfig.FLAVOR})")
    ReactNativeApplicationEntryPoint.loadReactNative(this)
    logBoot("ReactNativeApplicationEntryPoint.loadReactNative invoked")
    FirebaseApp.initializeApp(this)
    logBoot("Firebase initialized")
    OneSignalRestoreGuard.initialize(this, resolveOneSignalAppId())
    logBoot("OneSignal guard initialized")
    pinMetroHostToLocalhost()
    logBoot("Metro host pinned (if applicable)")
    IntercomModule.initialize(
      this,
      "android_sdk-4986fecd43c2bdfd8deadc5f4965062979e9476e",
      "xiivsyz8",
    )
    logBoot("Intercom initialized")
  }

  override fun registerReceiver(receiver: BroadcastReceiver?, filter: IntentFilter): Intent? {
    return if (Build.VERSION.SDK_INT >= 34 && applicationInfo.targetSdkVersion >= 34) {
      super.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      super.registerReceiver(receiver, filter)
    }
  }

  override fun getFileProviderAuthority(): String = "com.kyte.provider"

  @Suppress("DEPRECATION") // PackagerConnectionSettings still relies on android.preference APIs.
  private fun pinMetroHostToLocalhost() {
    if (!reactNativeHost.useDeveloperSupport) return
    val prefs = PreferenceManager.getDefaultSharedPreferences(this)
    val desiredHost = "localhost:8081"
    if (prefs.getString(DEBUG_HTTP_HOST_KEY, null) != desiredHost) {
      prefs.edit().putString(DEBUG_HTTP_HOST_KEY, desiredHost).apply()
    }
  }

  private fun resolveOneSignalAppId(): String {
    return if (BuildConfig.FLAVOR.contains("catalog")) {
      BuildConfig.ONESIGNAL_CATALOG_APP_ID
    } else {
      BuildConfig.ONESIGNAL_POS_APP_ID
    }
  }

  private companion object {
    const val DEBUG_HTTP_HOST_KEY = "debug_http_host"
    const val BOOT_TAG = "KyteBoot"
  }

  private fun logBoot(message: String) {
    Log.i(BOOT_TAG, message)
  }
}
