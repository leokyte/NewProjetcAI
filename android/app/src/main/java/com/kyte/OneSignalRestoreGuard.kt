package com.kyte

import android.content.Context
import android.util.Log
import com.onesignal.OneSignal
import com.onesignal.notifications.INotificationLifecycleListener
import com.onesignal.notifications.INotificationWillDisplayEvent
import com.onesignal.notifications.INotificationsManager

object OneSignalRestoreGuard : INotificationLifecycleListener {
  private const val TAG = "OneSignalRestoreGuard"
  private var isInitialized = false

  fun initialize(context: Context, appId: String) {
    if (isInitialized || appId.isBlank()) return
    try {
      Log.i(TAG, "Initializing OneSignal with appId suffix=${appId.takeLast(4)}")
      OneSignal.initWithContext(context, appId)
      resolveNotificationsManager()?.addForegroundLifecycleListener(this)
      Log.i(TAG, "OneSignal lifecycle listener registered")
      isInitialized = true
    } catch (e: Exception) {
      Log.e(TAG, "Failed to set up OneSignal restore guard", e)
    }
  }

  override fun onWillDisplay(event: INotificationWillDisplayEvent) {
    val rawPayload = event.notification.rawPayload
    val isRestoredPayload =
        rawPayload?.let { payload ->
          payload.contains("\"restoring\":true", ignoreCase = true) ||
              payload.contains("\"restored\":true", ignoreCase = true) ||
              payload.contains("\"is_restoring\":true", ignoreCase = true)
        } ?: false

    if (isRestoredPayload) {
      event.preventDefault()
      return
    }
  }

  private fun resolveNotificationsManager(): INotificationsManager? {
    return try {
      val method = OneSignal::class.java.getMethod("getNotifications")
      method.invoke(null) as? INotificationsManager
    } catch (e: Exception) {
      Log.e(TAG, "Unable to resolve OneSignal notifications manager", e)
      null
    }
  }
}
