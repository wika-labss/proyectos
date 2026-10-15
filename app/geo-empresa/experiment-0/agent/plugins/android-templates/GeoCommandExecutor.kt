package com.wika.geoempresa

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.json.JSONObject
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

object GeoCommandExecutor {
  private const val TAG = "GeoEmpresa"
  private val main = Handler(Looper.getMainLooper())

  fun execute(context: Context, commandId: String, type: String, emit: (JSONObject) -> Unit) {
    when (type.uppercase()) {
      "LOCK" -> handleLock(context, commandId, emit)
      "UNLOCK" -> handleUnlock(context, commandId, emit)
      "LOCATE" -> handleLocate(context, commandId, emit)
      "REBOOT" -> handleReboot(context, commandId, emit)
      "STATUS" -> handleStatus(context, commandId, emit)
      else -> emit(ack(commandId, false, "tipo no soportado"))
    }
  }

  private fun handleLock(context: Context, commandId: String, emit: (JSONObject) -> Unit) {
    main.post {
      try {
        GeoLockController.applyHardLock(
          context,
          "Teléfono bloqueado",
          "Bloqueo enviado por el administrador. Ingresa el PIN corporativo.",
        )
      } catch (error: Exception) {
        Log.e(TAG, "LOCK failed", error)
        emit(ack(commandId, false, error.message ?: "lock failed"))
        return@post
      }
      main.postDelayed({
        val kiosk = GeoLockController.isLockTaskActive(context)
        emit(ack(commandId, kiosk, if (kiosk) null else "kiosk no activo").put("kiosk", kiosk))
      }, 2000)
    }
  }

  private fun handleUnlock(context: Context, commandId: String, emit: (JSONObject) -> Unit) {
    main.post {
      try {
        val intent = Intent(context, SecurityLockActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
          putExtra(SecurityLockActivity.EXTRA_ADMIN_UNLOCK, true)
        }
        context.startActivity(intent)
      } catch (error: Exception) {
        emit(ack(commandId, false, error.message ?: "unlock failed"))
        return@post
      }
      main.postDelayed({
        val kiosk = GeoLockController.isLockTaskActive(context)
        emit(ack(commandId, !kiosk, if (kiosk) "aún en kiosco" else null).put("kiosk", kiosk))
      }, 1500)
    }
  }

  private fun handleLocate(context: Context, commandId: String, emit: (JSONObject) -> Unit) {
    Thread {
      val loc = lastKnownLocation(context)
      if (loc == null) {
        emit(ack(commandId, false, "sin ubicación"))
        return@Thread
      }
      emit(
        ack(commandId, true, null)
          .put("lat", loc.latitude)
          .put("lng", loc.longitude)
          .put("accuracyM", loc.accuracy.toDouble()),
      )
    }.start()
  }

  private fun handleReboot(context: Context, commandId: String, emit: (JSONObject) -> Unit) {
    val dpm = GeoLockController.devicePolicyManager(context)
    if (!dpm.isDeviceOwnerApp(context.packageName)) {
      emit(ack(commandId, false, "no device owner"))
      return
    }
    emit(ack(commandId, true, null))
    main.postDelayed({
      try {
        dpm.reboot(GeoLockController.adminComponent(context))
      } catch (error: Exception) {
        Log.e(TAG, "REBOOT failed", error)
      }
    }, 500)
  }

  private fun handleStatus(context: Context, commandId: String, emit: (JSONObject) -> Unit) {
    val dpm = GeoLockController.devicePolicyManager(context)
    emit(
      ack(commandId, true, null)
        .put("kiosk", GeoLockController.isLockTaskActive(context))
        .put("isDeviceOwner", dpm.isDeviceOwnerApp(context.packageName))
        .put("airplane", GeoLockController.isAirplaneModeOn(context))
        .put("gpsOn", GeoLockController.isGpsEnabled(context))
        .put("networkOk", GeoLockController.isInternetAvailable(context)),
    )
  }

  @Suppress("MissingPermission")
  fun lastKnownLocation(context: Context): Location? {
    return try {
      val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
      manager.getProviders(true).mapNotNull { provider ->
        try {
          manager.getLastKnownLocation(provider)
        } catch (_: Exception) {
          null
        }
      }.maxByOrNull { it.time }
    } catch (error: Exception) {
      Log.e(TAG, "lastKnownLocation failed", error)
      null
    }
  }

  private fun ack(commandId: String, ok: Boolean, error: String?): JSONObject {
    val body = JSONObject()
      .put("kind", "ack")
      .put("commandId", commandId)
      .put("ok", ok)
    if (error != null) body.put("error", error)
    return body
  }
}
