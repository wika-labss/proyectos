package com.wika.geoempresa

import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

object GeoCommandClient {
  private const val TAG = "GeoEmpresa"
  const val KEY_URL = "supabase_url"
  const val KEY_ANON = "supabase_anon"
  const val KEY_FP = "device_fingerprint"
  const val KEY_FAILS = "backend_fail_count"
  private const val POLL_MS = 5_000L
  private const val LOCATION_MS = 30_000L
  private val main = Handler(Looper.getMainLooper())
  @Volatile private var lastPollAt = 0L
  @Volatile private var lastLocationAt = 0L
  @Volatile private var polling = false
  @Volatile private var reporting = false

  fun maybePoll(context: Context) {
    val now = System.currentTimeMillis()
    if (now - lastPollAt < POLL_MS || polling) {
      return
    }
    lastPollAt = now
    polling = true
    Thread {
      try {
        tick(context)
      } catch (error: Exception) {
        Log.e(TAG, "command poll failed", error)
        onBackendFailure(context)
      } finally {
        polling = false
      }
    }.start()
  }

  fun maybeReportLocation(context: Context) {
    val now = System.currentTimeMillis()
    if (now - lastLocationAt < LOCATION_MS || reporting) {
      return
    }
    lastLocationAt = now
    reporting = true
    Thread {
      try {
        val creds = credentials(context) ?: return@Thread
        val ok = reportLocation(context, creds.first, creds.second, creds.third)
        Log.i(TAG, "location ping 30s ok=$ok")
        if (!ok && !GeoLockController.isInternetAvailable(context)) {
          onBackendFailure(context)
        }
      } catch (error: Exception) {
        Log.e(TAG, "location ping 30s failed", error)
      } finally {
        reporting = false
      }
    }.start()
  }

  private fun credentials(context: Context): Triple<String, String, String>? {
    val prefs = context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
    val url = prefs.getString(KEY_URL, null)
    val anon = prefs.getString(KEY_ANON, null)
    val fingerprint = prefs.getString(KEY_FP, null)
    if (url.isNullOrBlank() || anon.isNullOrBlank() || fingerprint.isNullOrBlank()) {
      Log.w(TAG, "agent not provisioned (missing url/anon/fingerprint)")
      return null
    }
    return Triple(url, anon, fingerprint)
  }

  private fun tick(context: Context) {
    val creds = credentials(context) ?: return
    val url = creds.first
    val anon = creds.second
    val fingerprint = creds.third

    val payload = JSONObject().put("p_device_fingerprint", fingerprint)
    val result = postRpc(url, anon, "heartbeat_agente", payload)
    if (result == null || !result.optBoolean("ok", false)) {
      Log.w(TAG, "heartbeat_agente failed")
      onBackendFailure(context)
      return
    }

    context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
      .edit()
      .putInt(KEY_FAILS, 0)
      .apply()

    val comando = result.optJSONObject("comando")
    val tipo = comando?.optString("tipo") ?: "none"
    Log.i(TAG, "poll ok comando=$tipo")

    if (comando == null) {
      return
    }
    val comandoId = comando.optString("id")
    when (tipo) {
      "lock" -> {
        val kiosk = requestKioskAndWait(
          context,
          "Teléfono bloqueado",
          "Bloqueo enviado por el administrador. Ingresa el PIN corporativo.",
        )
        Log.i(TAG, "admin lock kiosk=$kiosk")
        acusar(url, anon, fingerprint, comandoId, kiosk, if (kiosk) null else "kiosk no activo")
      }
      "ping" -> {
        val ok = reportLocation(context, url, anon, fingerprint)
        Log.i(TAG, "admin ping gps=$ok")
        acusar(url, anon, fingerprint, comandoId, ok, if (ok) null else "sin ubicación")
      }
      else -> acusar(url, anon, fingerprint, comandoId, false, "tipo no soportado")
    }
  }

  private fun onBackendFailure(context: Context) {
    Log.w(TAG, "backend unreachable — hard lock")
    lockOnMain(
      context,
      "Teléfono bloqueado",
      "Sin internet. Ingresa el PIN corporativo.",
      true,
    )
  }

  private fun requestKioskAndWait(context: Context, title: String, message: String): Boolean {
    if (GeoLockController.isLockTaskActive(context)) {
      return true
    }
    val latch = CountDownLatch(1)
    main.post {
      try {
        GeoLockController.applyHardLock(context, title, message)
      } finally {
        latch.countDown()
      }
    }
    latch.await(2, TimeUnit.SECONDS)
    val deadline = System.currentTimeMillis() + 4000
    while (System.currentTimeMillis() < deadline) {
      if (GeoLockController.isLockTaskActive(context)) {
        return true
      }
      try {
        Thread.sleep(250)
      } catch (_: InterruptedException) {
        break
      }
    }
    return GeoLockController.isLockTaskActive(context)
  }

  private fun lockOnMain(context: Context, title: String, message: String, force: Boolean) {
    main.post {
      GeoLockController.applyFullLock(context, title, message, force)
    }
  }

  private fun reportLocation(
    context: Context,
    baseUrl: String,
    anon: String,
    fingerprint: String,
  ): Boolean {
    val location = lastKnownLocation(context) ?: return false
    val body = JSONObject()
      .put("p_device_fingerprint", fingerprint)
      .put("p_lat", location.latitude)
      .put("p_lng", location.longitude)
      .put("p_precision_m", location.accuracy.toDouble())
      .put("p_telefono_encendido", true)
    return postRpc(baseUrl, anon, "reportar_ubicacion", body) != null
  }

  @Suppress("MissingPermission")
  private fun lastKnownLocation(context: Context): Location? {
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

  private fun acusar(
    baseUrl: String,
    anon: String,
    fingerprint: String,
    comandoId: String,
    ok: Boolean,
    error: String?,
  ) {
    val body = JSONObject()
      .put("p_comando_id", comandoId)
      .put("p_device_fingerprint", fingerprint)
      .put("p_ok", ok)
    if (error != null) {
      body.put("p_error", error)
    }
    postRpc(baseUrl, anon, "acusar_comando", body)
  }

  private fun postRpc(baseUrl: String, anon: String, rpc: String, body: JSONObject): JSONObject? {
    var connection: HttpURLConnection? = null
    return try {
      val endpoint = URL("${baseUrl.trimEnd('/')}/rest/v1/rpc/$rpc")
      connection = (endpoint.openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 5_000
        readTimeout = 5_000
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
        setRequestProperty("apikey", anon)
        setRequestProperty("Authorization", "Bearer $anon")
      }
      OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
        writer.write(body.toString())
      }
      val code = connection.responseCode
      val stream = if (code in 200..299) connection.inputStream else connection.errorStream
      val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
      if (code !in 200..299) {
        Log.w(TAG, "RPC $rpc HTTP $code $text")
        return null
      }
      if (text.isBlank() || text == "null") {
        JSONObject().put("ok", true)
      } else {
        JSONObject(text)
      }
    } catch (error: Exception) {
      Log.e(TAG, "RPC $rpc failed", error)
      null
    } finally {
      connection?.disconnect()
    }
  }
}
