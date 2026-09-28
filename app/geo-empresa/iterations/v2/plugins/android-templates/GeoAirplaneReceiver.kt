package com.wika.geoempresa

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class GeoAirplaneReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_AIRPLANE_MODE_CHANGED) {
      return
    }
    val airplaneOn = intent.getBooleanExtra("state", GeoLockController.isAirplaneModeOn(context))
    Log.i("GeoEmpresa", "AIRPLANE_MODE state=$airplaneOn")
    if (!airplaneOn) {
      return
    }
    GeoLockController.applyFullLock(
      context,
      "Teléfono bloqueado",
      "Modo avión detectado. Ingresa el PIN corporativo.",
    )
  }
}
