package com.wika.geoempresa

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class GeoBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_BOOT_COMPLETED) {
      return
    }
    Log.i("GeoEmpresa", "BOOT_COMPLETED")
    GeoLockController.ensurePolicies(context)
    GeoLockService.start(context)
    if (GeoLockController.isAirplaneModeOn(context)) {
      GeoLockController.applyFullLock(
        context,
        "Teléfono bloqueado",
        "Modo avión detectado. Ingresa el PIN corporativo.",
      )
    }
  }
}
