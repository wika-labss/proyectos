package com.wika.geoempresa

import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

object GeoBrokerClient {
  private const val TAG = "GeoEmpresa"
  const val KEY_BROKER_WS = "broker_ws_url"
  private const val RECONNECT_MS = 5000L
  private const val TELEMETRY_MS = 30_000L

  private val client = OkHttpClient.Builder()
    .pingInterval(25, TimeUnit.SECONDS)
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(0, TimeUnit.MILLISECONDS)
    .build()

  private val main = Handler(Looper.getMainLooper())
  private var webSocket: WebSocket? = null
  private var reconnectScheduled = false
  private val telemetryScheduled = AtomicBoolean(false)

  fun deviceId(context: Context): String {
    val prefs = context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
    val stored = prefs.getString("device_id", null)
    if (!stored.isNullOrBlank()) return stored
    val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"
    val id = "android-$androidId"
    prefs.edit().putString("device_id", id).apply()
    return id
  }

  fun brokerWsUrl(context: Context): String? {
    return context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
      .getString(KEY_BROKER_WS, null)
      ?.trim()
      ?.takeIf { it.isNotEmpty() }
  }

  fun configure(context: Context, wsUrl: String) {
    context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_BROKER_WS, wsUrl.trim())
      .apply()
    disconnect()
    connect(context.applicationContext)
  }

  fun start(context: Context) {
    connect(context.applicationContext)
    scheduleTelemetry(context.applicationContext)
  }

  fun disconnect() {
    try {
      webSocket?.close(1000, "shutdown")
    } catch (_: Exception) {
    }
    webSocket = null
  }

  private fun connect(context: Context) {
    val base = brokerWsUrl(context) ?: run {
      Log.w(TAG, "broker WS URL not configured")
      scheduleReconnect(context)
      return
    }
    val id = deviceId(context)
    val url = if (base.contains('?')) "$base&deviceId=$id" else "$base?deviceId=$id"
    Log.i(TAG, "broker connect $url")
    val request = Request.Builder().url(url).build()
    webSocket = client.newWebSocket(request, object : WebSocketListener() {
      override fun onOpen(webSocket: WebSocket, response: Response) {
        Log.i(TAG, "broker WS open")
        sendHello(context, webSocket)
      }

      override fun onMessage(webSocket: WebSocket, text: String) {
        handleMessage(context, text)
      }

      override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
        webSocket.close(code, reason)
      }

      override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        Log.w(TAG, "broker WS closed code=$code")
        scheduleReconnect(context)
      }

      override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        Log.e(TAG, "broker WS failure", t)
        scheduleReconnect(context)
      }
    })
  }

  private fun scheduleReconnect(context: Context) {
    if (reconnectScheduled) return
    reconnectScheduled = true
    main.postDelayed({
      reconnectScheduled = false
      connect(context.applicationContext)
    }, RECONNECT_MS)
  }

  private fun sendHello(context: Context, ws: WebSocket) {
    val dpm = GeoLockController.devicePolicyManager(context)
    val owner = dpm.isDeviceOwnerApp(context.packageName)
    val body = JSONObject()
      .put("kind", "hello")
      .put("model", Build.MODEL)
      .put("appVersion", appVersion(context))
      .put("isDeviceOwner", owner)
      .put("androidSdk", Build.VERSION.SDK_INT)
    ws.send(body.toString())
  }

  private fun handleMessage(context: Context, text: String) {
    try {
      val json = JSONObject(text)
      val kind = json.optString("kind", json.optString("type", ""))
      if (kind == "pong") return
      if (kind != "command") return
      val commandId = json.getString("id")
      val type = json.getString("type")
      Log.i(TAG, "broker command $type id=$commandId")
      GeoCommandExecutor.execute(context.applicationContext, commandId, type) { ack ->
        sendAck(ack)
      }
    } catch (error: Exception) {
      Log.e(TAG, "broker message parse failed", error)
    }
  }

  private fun sendAck(ack: JSONObject) {
    try {
      webSocket?.send(ack.toString())
    } catch (error: Exception) {
      Log.e(TAG, "broker ack send failed", error)
    }
  }

  fun sendAck(context: Context, commandId: String, ok: Boolean, error: String? = null, extra: JSONObject? = null) {
    val body = JSONObject()
      .put("kind", "ack")
      .put("commandId", commandId)
      .put("ok", ok)
    if (error != null) body.put("error", error)
    extra?.keys()?.forEach { key -> body.put(key, extra.get(key)) }
    sendAck(body)
  }

  private fun scheduleTelemetry(context: Context) {
    if (!telemetryScheduled.compareAndSet(false, true)) return
    val tick = object : Runnable {
      override fun run() {
        publishTelemetry(context.applicationContext)
        main.postDelayed(this, TELEMETRY_MS)
      }
    }
    main.post(tick)
  }

  private fun appVersion(context: Context): String {
    return try {
      context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "0.1.0"
    } catch (_: Exception) {
      "0.1.0"
    }
  }

  fun publishTelemetry(context: Context) {
    val ws = webSocket ?: return
    try {
      val loc = GeoCommandExecutor.lastKnownLocation(context)
      val body = JSONObject()
        .put("kind", "telemetry")
        .put("kiosk", GeoLockController.isLockTaskActive(context))
        .put("airplane", GeoLockController.isAirplaneModeOn(context))
        .put("gpsOn", GeoLockController.isGpsEnabled(context))
        .put("networkOk", GeoLockController.isInternetAvailable(context))
        .put("isDeviceOwner", GeoLockController.devicePolicyManager(context).isDeviceOwnerApp(context.packageName))
      if (loc != null) {
        body.put("lat", loc.latitude)
        body.put("lng", loc.longitude)
        body.put("accuracyM", loc.accuracy.toDouble())
      }
      ws.send(body.toString())
    } catch (error: Exception) {
      Log.w(TAG, "telemetry failed", error)
    }
  }
}
