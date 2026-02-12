package com.kyte

import android.content.Intent
import android.content.pm.ActivityInfo
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "kyte"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Switch from splash theme to the runtime theme as soon as the activity is created.
    setTheme(R.style.AppTheme)
    Log.i("KyteBoot", "MainActivity onCreate: theme switched to AppTheme")
    super.onCreate(null)
    val isTablet = resources.getBoolean(R.bool.isTablet)
    if (!isTablet) {
      requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
  }

  override fun onResume() {
    super.onResume()
    Log.i("KyteBoot", "MainActivity onResume")
  }
}
