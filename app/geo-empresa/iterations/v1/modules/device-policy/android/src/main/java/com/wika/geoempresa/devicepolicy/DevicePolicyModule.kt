package com.wika.geoempresa.devicepolicy

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.SecureRandom

class DevicePolicyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DevicePolicy")

    Function("lockNow") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("Sin contexto")
      val dpm = manager(ctx)
      val admin = adminComponent(ctx)
      if (!dpm.isAdminActive(admin)) {
        throw IllegalStateException("Device Admin no activo")
      }
      dpm.lockNow()
    }

    Function("reboot") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("Sin contexto")
      val dpm = manager(ctx)
      if (!dpm.isDeviceOwnerApp(ctx.packageName)) {
        throw IllegalStateException("Requiere Device Owner")
      }
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
        throw IllegalStateException("reboot requiere API 24+")
      }
      dpm.reboot(adminComponent(ctx))
    }

    AsyncFunction("resetPin") { pin: String ->
      val ctx = appContext.reactContext ?: throw IllegalStateException("Sin contexto")
      val dpm = manager(ctx)
      val admin = adminComponent(ctx)
      if (!dpm.isDeviceOwnerApp(ctx.packageName)) {
        throw IllegalStateException("Requiere Device Owner")
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val token = loadOrCreateToken(ctx, dpm, admin)
        val ok = dpm.resetPasswordWithToken(admin, pin, token, 0)
        if (!ok) throw IllegalStateException("resetPasswordWithToken falló")
      } else {
        @Suppress("DEPRECATION")
        val ok = dpm.resetPassword(pin, 0)
        if (!ok) throw IllegalStateException("resetPassword falló")
      }
    }

    Function("getPolicyStatus") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("Sin contexto")
      val dpm = manager(ctx)
      val admin = adminComponent(ctx)
      mapOf(
        "isDeviceOwner" to dpm.isDeviceOwnerApp(ctx.packageName),
        "isAdminActive" to dpm.isAdminActive(admin)
      )
    }

    AsyncFunction("ensureResetPasswordToken") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("Sin contexto")
      val dpm = manager(ctx)
      val admin = adminComponent(ctx)
      if (!dpm.isDeviceOwnerApp(ctx.packageName)) return@AsyncFunction false
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@AsyncFunction true
      loadOrCreateToken(ctx, dpm, admin)
      true
    }
  }

  private fun manager(ctx: Context): DevicePolicyManager {
    return ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
  }

  private fun adminComponent(ctx: Context): ComponentName {
    return ComponentName(ctx, GeoDeviceAdminReceiver::class.java)
  }

  private fun loadOrCreateToken(
    ctx: Context,
    dpm: DevicePolicyManager,
    admin: ComponentName
  ): ByteArray {
    val prefs = ctx.getSharedPreferences("geo_device_policy", Context.MODE_PRIVATE)
    val stored = prefs.getString("reset_token", null)
    if (stored != null) {
      val bytes = Base64.decode(stored, Base64.NO_WRAP)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && dpm.isResetPasswordTokenActive(admin)) {
        return bytes
      }
    }
    val token = ByteArray(32)
    SecureRandom().nextBytes(token)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val ok = dpm.setResetPasswordToken(admin, token)
      if (!ok) throw IllegalStateException("setResetPasswordToken falló")
    }
    prefs.edit().putString("reset_token", Base64.encodeToString(token, Base64.NO_WRAP)).apply()
    return token
  }
}
