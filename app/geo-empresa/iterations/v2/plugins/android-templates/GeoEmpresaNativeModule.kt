package com.wika.geoempresa

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class GeoEmpresaNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val adminComponent: ComponentName by lazy {
    ComponentName(reactContext, GeoDeviceAdminReceiver::class.java)
  }

  override fun getName(): String = "GeoEmpresaNative"

  private fun devicePolicyManager(): DevicePolicyManager {
    return reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
  }

  private fun currentActivity(): Activity? = reactContext.currentActivity

  @ReactMethod
  fun isDeviceAdminActive(promise: Promise) {
    try {
      promise.resolve(devicePolicyManager().isAdminActive(adminComponent))
    } catch (error: Exception) {
      promise.reject("admin_error", error)
    }
  }

  @ReactMethod
  fun requestDeviceAdmin(promise: Promise) {
    try {
      if (devicePolicyManager().isAdminActive(adminComponent)) {
        promise.resolve(true)
        return
      }
      val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
        putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent)
        putExtra(
          DevicePolicyManager.EXTRA_ADD_EXPLANATION,
          "Geo Empresa requiere administrador de dispositivo para proteger el monitoreo corporativo.",
        )
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("admin_request_error", error)
    }
  }

  @ReactMethod
  fun removeDeviceAdminWithPin(pin: String, promise: Promise) {
    try {
      if (pin != DEFAULT_PIN) {
        promise.resolve(false)
        return
      }
      if (!devicePolicyManager().isAdminActive(adminComponent)) {
        promise.resolve(true)
        return
      }
      devicePolicyManager().removeActiveAdmin(adminComponent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("admin_remove_error", error)
    }
  }

  @ReactMethod
  fun isAirplaneModeOn(promise: Promise) {
    try {
      val enabled = Settings.Global.getInt(
        reactContext.contentResolver,
        Settings.Global.AIRPLANE_MODE_ON,
        0,
      ) == 1
      promise.resolve(enabled)
    } catch (error: Exception) {
      promise.reject("airplane_error", error)
    }
  }

  @ReactMethod
  fun openAirplaneSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_AIRPLANE_MODE_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("airplane_settings_error", error)
    }
  }

  @ReactMethod
  fun requestIgnoreBatteryOptimizations(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(null)
        return
      }
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = Uri.parse("package:${reactContext.packageName}")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("battery_opt_error", error)
    }
  }

  @ReactMethod
  fun requestOverlayPermission(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(null)
        return
      }
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${reactContext.packageName}"),
      ).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("overlay_permission_error", error)
    }
  }

  @ReactMethod
  fun showSecurityLock(title: String, message: String, promise: Promise) {
    try {
      val intent = Intent(reactContext, SecurityLockActivity::class.java).apply {
        putExtra(SecurityLockActivity.EXTRA_TITLE, title)
        putExtra(SecurityLockActivity.EXTRA_MESSAGE, message)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      }
      reactContext.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("security_lock_error", error)
    }
  }

  @ReactMethod
  fun hideSecurityLock(promise: Promise) {
    try {
      val activity = currentActivity()
      if (activity is SecurityLockActivity) {
        activity.finish()
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("hide_security_lock_error", error)
    }
  }

  @ReactMethod
  fun startLockTask(promise: Promise) {
    try {
      val activity = currentActivity()
      if (activity != null && devicePolicyManager().isDeviceOwnerApp(reactContext.packageName)) {
        activity.startLockTask()
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("start_lock_task_error", error)
    }
  }

  @ReactMethod
  fun stopLockTask(promise: Promise) {
    try {
      val activity = currentActivity()
      activity?.stopLockTask()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("stop_lock_task_error", error)
    }
  }

  @ReactMethod
  fun moveAppToBackground(promise: Promise) {
    try {
      val activity = currentActivity()
      activity?.moveTaskToBack(true)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("move_background_error", error)
    }
  }

  @ReactMethod
  fun bringAppToForeground(promise: Promise) {
    try {
      val intent = reactContext.packageManager.getLaunchIntentForPackage(reactContext.packageName)?.apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      }
      if (intent != null) {
        reactContext.startActivity(intent)
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("bring_foreground_error", error)
    }
  }

  companion object {
    private const val DEFAULT_PIN = "1312"
  }
}
