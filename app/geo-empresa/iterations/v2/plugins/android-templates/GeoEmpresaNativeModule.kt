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
  fun configureAgent(url: String, anonKey: String, fingerprint: String, promise: Promise) {
    try {
      reactContext.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
        .edit()
        .putString(GeoCommandClient.KEY_URL, url)
        .putString(GeoCommandClient.KEY_ANON, anonKey)
        .putString(GeoCommandClient.KEY_FP, fingerprint)
        .apply()
      GeoLockController.ensurePolicies(reactContext)
      GeoLockService.start(reactContext)
      GeoCommandClient.maybePoll(reactContext)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("configure_agent_error", error)
    }
  }

  @ReactMethod
  fun lockDevice(title: String, message: String, promise: Promise) {
    try {
      GeoLockController.applyFullLock(reactContext, title, message, false)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("lock_device_error", error)
    }
  }

  @ReactMethod
  fun lockDeviceForced(title: String, message: String, promise: Promise) {
    try {
      GeoLockController.applyFullLock(reactContext, title, message, true)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("lock_device_forced_error", error)
    }
  }

  @ReactMethod
  fun showSecurityLock(title: String, message: String, promise: Promise) {
    lockDevice(title, message, promise)
  }

  @ReactMethod
  fun hideSecurityLock(promise: Promise) {
    try {
      val activity = currentActivity()
      if (activity is SecurityLockActivity) {
        GeoLockController.clearLock(activity)
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("hide_security_lock_error", error)
    }
  }

  @ReactMethod
  fun startLockTask(promise: Promise) {
    try {
      GeoLockController.applyFullLock(
        reactContext,
        "Teléfono bloqueado",
        "Política corporativa activa. Ingresa el PIN corporativo.",
        true,
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("start_lock_task_error", error)
    }
  }

  @ReactMethod
  fun stopLockTask(promise: Promise) {
    try {
      val activity = currentActivity()
      if (activity is SecurityLockActivity) {
        GeoLockController.clearLock(activity)
      } else {
        activity?.stopLockTask()
      }
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

  @ReactMethod
  fun startWatchdog(promise: Promise) {
    try {
      GeoLockController.ensurePolicies(reactContext)
      GeoLockService.start(reactContext)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("watchdog_error", error)
    }
  }

  @ReactMethod
  fun isLockTaskActive(promise: Promise) {
    try {
      promise.resolve(GeoLockController.isLockTaskActive(reactContext))
    } catch (error: Exception) {
      promise.reject("lock_task_state_error", error)
    }
  }

  companion object {
    private const val DEFAULT_PIN = "1312"
  }
}
