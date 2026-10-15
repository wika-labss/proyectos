package com.wika.geoempresa

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GeoEmpresaNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "GeoEmpresaNative"

  @ReactMethod
  fun configureBroker(wsUrl: String, promise: Promise) {
    try {
      GeoBrokerClient.configure(reactContext, wsUrl)
      GeoLockController.ensurePolicies(reactContext)
      GeoLockService.start(reactContext)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("configure_broker_error", error)
    }
  }

  @ReactMethod
  fun getDeviceId(promise: Promise) {
    try {
      promise.resolve(GeoBrokerClient.deviceId(reactContext))
    } catch (error: Exception) {
      promise.reject("device_id_error", error)
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
  fun moveAppToBackground(promise: Promise) {
    try {
      reactContext.currentActivity?.moveTaskToBack(true)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("move_background_error", error)
    }
  }

  @ReactMethod
  fun isDeviceOwner(promise: Promise) {
    try {
      val dpm = GeoLockController.devicePolicyManager(reactContext)
      promise.resolve(dpm.isDeviceOwnerApp(reactContext.packageName))
    } catch (error: Exception) {
      promise.reject("owner_error", error)
    }
  }
}
