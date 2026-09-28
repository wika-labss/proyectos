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

object GeoCommandClient {
  private const val TAG = "GeoEmpresa"
  const val KEY_URL = "supabase_url"
  const val KEY_ANON = "supabase_anon"
  const val KEY_FP = "device_fingerprint"
  const val KEY_FAILS = "backend_fail_count"
  private const val POLL_MS = 8_000L
  private const val FAIL_LIMIT = 3
  private val main = Handler(Looper.getMainLooper())
  @Volatile private var lastPollAt = 0L
  @Volatile private var polling = false

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

  private fun tick(context: Context) {
    val prefs = context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
    val url = prefs.getString(KEY_URL, null)
    val anon = prefs.getString(KEY_ANON, null)
    val fingerprint = prefs.getString(KEY_FP, null)
    if (url.isNullOrBlank() || anon.isNullOrBlank() || fingerprint.isNullOrBlank()) {
      return
    }

    val payload = JSONObject().put("p_device_fingerprint", fingerprint)
    val result = postRpc(url, anon, "heartbeat_agente", payload)
    if (result == null || !result.optBoolean("ok", false)) {
      onBackendFailure(context)
      return
    }

    prefs.edit().putInt(KEY_FAILS, 0).apply()

    if (result.optBoolean("admin_stale", false)) {
      lockOnMain(
        context,
        "Teléfono bloqueado",
        "Sin ping del administrador. Ingresa el PIN corporativo.",
        false,
      )
    }

    val inside = result.optBoolean("dentro_perimetro", true)
    val autolock = result.optBoolean("politica_autolock", true)
    if (!inside && autolock) {
      val dist = result.optDouble("distancia_base_m", 0.0)
      val radio = result.optInt("radio_metros", 20)
      lockOnMain(
        context,
        "Teléfono bloqueado",
        "Fuera del perímetro autorizado (${dist.toInt()} m / máx $radio m).",
        false,
      )
    }

    val comando = result.optJSONObject("comando") ?: return
    val tipo = comando.optString("tipo")
    val comandoId = comando.optString("id")
    when (tipo) {
      "lock" -> {
        lockOnMain(
          context,
          "Teléfono bloqueado",
          "Bloqueo enviado por el administrador. Ingresa el PIN corporativo.",
          true,
        )
        acusar(url, anon, fingerprint, comandoId, true, null)
      }
      "ping" -> {
        val ok = reportLocation(context, url, anon, fingerprint)
        acusar(url, anon, fingerprint, comandoId, ok, if (ok) null else "sin ubicación")
      }
      else -> acusar(url, anon, fingerprint, comandoId, false, "tipo no soportado")
    }
  }

  private fun onBackendFailure(context: Context) {
    val prefs = context.getSharedPreferences(GeoLockController.PREFS, Context.MODE_PRIVATE)
    val fails = prefs.getInt(KEY_FAILS, 0) + 1
    prefs.edit().putInt(KEY_FAILS, fails).apply()
    Log.w(TAG, "backend fail count=$fails")
    if (fails >= FAIL_LIMIT) {
      lockOnMain(
        context,
        "Teléfono bloqueado",
        "Sin conexión con la base corporativa. Ingresa el PIN corporativo.",
        false,
      )
    }
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
        connectTimeout = 8_000
        readTimeout = 8_000
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
