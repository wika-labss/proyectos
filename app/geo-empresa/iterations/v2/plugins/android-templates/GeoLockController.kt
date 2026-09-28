package com.wika.geoempresa

import android.app.Activity
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Log

object GeoLockController {
  const val PREFS = "geo_empresa_lock"
  const val KEY_SNOOZE = "snooze_until"
  const val PACKAGE = "com.wika.geoempresa"
  const val PIN = "1312"
  private const val TAG = "GeoEmpresa"

  fun adminComponent(context: Context): ComponentName {
    return ComponentName(context, GeoDeviceAdminReceiver::class.java)
  }

  fun devicePolicyManager(context: Context): DevicePolicyManager {
    return context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
  }

  fun isAirplaneModeOn(context: Context): Boolean {
    return Settings.Global.getInt(context.contentResolver, Settings.Global.AIRPLANE_MODE_ON, 0) == 1
  }

  fun isSnoozed(context: Context): Boolean {
    val until = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_SNOOZE, 0L)
    return until > System.currentTimeMillis()
  }

  fun snooze(context: Context, durationMs: Long = 60 * 1000L) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putLong(KEY_SNOOZE, System.currentTimeMillis() + durationMs)
      .apply()
  }

  fun ensurePolicies(context: Context) {
    val dpm = devicePolicyManager(context)
    val admin = adminComponent(context)
    if (!dpm.isDeviceOwnerApp(context.packageName)) {
      Log.w(TAG, "ensurePolicies skipped: not device owner")
      return
    }
    try {
      dpm.setLockTaskPackages(admin, arrayOf(PACKAGE))
      Log.i(TAG, "setLockTaskPackages ok")
    } catch (error: Exception) {
      Log.e(TAG, "setLockTaskPackages failed", error)
    }
  }

  fun lockActivityIntent(context: Context, title: String, message: String): Intent {
    return Intent(context, SecurityLockActivity::class.java).apply {
      putExtra(SecurityLockActivity.EXTRA_TITLE, title)
      putExtra(SecurityLockActivity.EXTRA_MESSAGE, message)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_REORDER_TO_FRONT,
      )
    }
  }

  fun applyFullLock(context: Context, title: String, message: String) {
    if (isSnoozed(context)) {
      Log.i(TAG, "lock skipped: snoozed")
      return
    }
    if (isLockTaskActive(context)) {
      Log.i(TAG, "lock skipped: already kiosk")
      return
    }
    ensurePolicies(context)
    GeoLockService.requestKiosk(context, title, message)
  }

  fun onLockActivityReady(activity: Activity) {
    ensurePolicies(activity)
    val dpm = devicePolicyManager(activity)
    if (!dpm.isDeviceOwnerApp(activity.packageName)) {
      Log.w(TAG, "lock task skipped: not device owner")
      return
    }
    try {
      dpm.setStatusBarDisabled(adminComponent(activity), true)
    } catch (error: Exception) {
      Log.w(TAG, "setStatusBarDisabled failed", error)
    }
    try {
      activity.startLockTask()
      Log.i(TAG, "startLockTask ok")
    } catch (error: Exception) {
      Log.e(TAG, "startLockTask failed", error)
    }
  }

  fun isLockTaskActive(context: Context): Boolean {
    val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    return try {
      am.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
    } catch (_: Exception) {
      false
    }
  }

  fun clearLock(activity: Activity) {
    snooze(activity)
    val dpm = devicePolicyManager(activity)
    if (dpm.isDeviceOwnerApp(activity.packageName)) {
      try {
        dpm.setStatusBarDisabled(adminComponent(activity), false)
      } catch (error: Exception) {
        Log.w(TAG, "re-enable status bar failed", error)
      }
    }
    try {
      activity.stopLockTask()
    } catch (error: Exception) {
      Log.w(TAG, "stopLockTask failed", error)
    }
    activity.finish()
  }
}
