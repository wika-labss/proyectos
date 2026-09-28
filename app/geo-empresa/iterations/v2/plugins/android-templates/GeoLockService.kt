package com.wika.geoempresa

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log

class GeoLockService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var receiverRegistered = false

  private val airplaneReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action != Intent.ACTION_AIRPLANE_MODE_CHANGED) {
        return
      }
      val on = intent.getBooleanExtra("state", GeoLockController.isAirplaneModeOn(this@GeoLockService))
      Log.i(TAG, "service AIRPLANE_MODE state=$on")
      if (on) {
        GeoLockController.applyFullLock(
          this@GeoLockService,
          "Teléfono bloqueado",
          "Modo avión detectado. Ingresa el PIN corporativo.",
        )
      }
    }
  }

  private val watchdog = object : Runnable {
    override fun run() {
      if (GeoLockController.isAirplaneModeOn(this@GeoLockService) && !GeoLockController.isSnoozed(this@GeoLockService)) {
        Log.i(TAG, "watchdog airplane still on — kiosk")
        GeoLockController.applyFullLock(
          this@GeoLockService,
          "Teléfono bloqueado",
          "Modo avión detectado. Ingresa el PIN corporativo.",
        )
      }
      handler.postDelayed(this, WATCHDOG_MS)
    }
  }

  override fun onCreate() {
    super.onCreate()
    GeoLockController.ensurePolicies(this)
    createChannel()
    startForeground(NOTIF_ID, buildWatchNotification())
    registerAirplaneReceiver()
    handler.post(watchdog)
    Log.i(TAG, "GeoLockService started")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_KIOSK) {
      val title = intent.getStringExtra(EXTRA_TITLE) ?: "Teléfono bloqueado"
      val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "Ingresa el PIN corporativo."
      launchKiosk(title, message)
    }
    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(watchdog)
    if (receiverRegistered) {
      unregisterReceiver(airplaneReceiver)
      receiverRegistered = false
    }
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun registerAirplaneReceiver() {
    if (receiverRegistered) {
      return
    }
    val filter = IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(airplaneReceiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      registerReceiver(airplaneReceiver, filter)
    }
    receiverRegistered = true
  }

  private fun launchKiosk(title: String, message: String) {
    val lockIntent = GeoLockController.lockActivityIntent(this, title, message)
    val pending = PendingIntent.getActivity(
      this,
      1,
      lockIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val manager = getSystemService(NotificationManager::class.java)
    manager.notify(NOTIF_ID, buildLockNotification(title, message, pending))
    try {
      startActivity(lockIntent)
    } catch (error: Exception) {
      Log.e(TAG, "startActivity kiosk failed; full-screen intent posted", error)
    }
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = getSystemService(NotificationManager::class.java)
    val watch = NotificationChannel(CHANNEL_WATCH, "Monitoreo Geo Empresa", NotificationManager.IMPORTANCE_LOW)
    val lock = NotificationChannel(CHANNEL_LOCK, "Bloqueo corporativo", NotificationManager.IMPORTANCE_HIGH)
    lock.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    manager.createNotificationChannel(watch)
    manager.createNotificationChannel(lock)
  }

  private fun buildWatchNotification(): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_WATCH)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    return builder
      .setContentTitle("Geo Empresa")
      .setContentText("Vigilando modo avión, apagado y perímetro")
      .setSmallIcon(android.R.drawable.ic_lock_lock)
      .setOngoing(true)
      .build()
  }

  private fun buildLockNotification(title: String, message: String, fullScreen: PendingIntent): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_LOCK)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    return builder
      .setContentTitle(title)
      .setContentText(message)
      .setSmallIcon(android.R.drawable.ic_lock_lock)
      .setOngoing(true)
      .setCategory(Notification.CATEGORY_ALARM)
      .setFullScreenIntent(fullScreen, true)
      .setContentIntent(fullScreen)
      .build()
  }

  companion object {
    private const val TAG = "GeoEmpresa"
    private const val NOTIF_ID = 1312
    private const val CHANNEL_WATCH = "geo_watch"
    private const val CHANNEL_LOCK = "geo_lock"
    private const val WATCHDOG_MS = 4000L
    const val ACTION_KIOSK = "com.wika.geoempresa.ACTION_KIOSK"
    const val EXTRA_TITLE = "geo_title"
    const val EXTRA_MESSAGE = "geo_message"

    fun start(context: Context) {
      val intent = Intent(context, GeoLockService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun requestKiosk(context: Context, title: String, message: String) {
      start(context)
      val intent = Intent(context, GeoLockService::class.java).apply {
        action = ACTION_KIOSK
        putExtra(EXTRA_TITLE, title)
        putExtra(EXTRA_MESSAGE, message)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }
  }
}
