package com.wika.geoempresa

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

class SecurityLockActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (intent.getBooleanExtra(EXTRA_ADMIN_UNLOCK, false)) {
      adminUnlockAndFinish()
      return
    }

    window.addFlags(
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
    )

    val title = intent.getStringExtra(EXTRA_TITLE) ?: "Teléfono bloqueado"
    val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "Ingresa el PIN corporativo para continuar."

    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(Color.parseColor("#0F172A"))
      gravity = Gravity.CENTER
      setPadding(48, 48, 48, 48)
    }

    val titleView = TextView(this).apply {
      text = title
      setTextColor(Color.parseColor("#EF4444"))
      textSize = 22f
    }

    val messageView = TextView(this).apply {
      text = message
      setTextColor(Color.parseColor("#F8FAFC"))
      textSize = 16f
    }

    val pinInput = EditText(this).apply {
      hint = "PIN corporativo"
      setTextColor(Color.parseColor("#F8FAFC"))
      setHintTextColor(Color.parseColor("#94A3B8"))
      inputType = android.text.InputType.TYPE_CLASS_NUMBER or
        android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD
    }

    val unlockButton = Button(this).apply {
      text = "Desbloquear"
      setOnClickListener {
        if (pinInput.text.toString() == GeoLockController.PIN) {
          GeoLockController.clearLock(this@SecurityLockActivity)
        } else {
          pinInput.error = "PIN incorrecto"
        }
      }
    }

    layout.addView(titleView)
    layout.addView(messageView)
    layout.addView(pinInput)
    layout.addView(unlockButton)
    setContentView(layout)
  }

  override fun onNewIntent(intent: android.content.Intent?) {
    super.onNewIntent(intent)
    if (intent?.getBooleanExtra(EXTRA_ADMIN_UNLOCK, false) == true) {
      adminUnlockAndFinish()
    }
  }

  private fun adminUnlockAndFinish() {
    val dpm = GeoLockController.devicePolicyManager(this)
    if (dpm.isDeviceOwnerApp(packageName)) {
      try {
        dpm.setStatusBarDisabled(GeoLockController.adminComponent(this), false)
      } catch (_: Exception) {
      }
    }
    try {
      stopLockTask()
    } catch (_: Exception) {
    }
    finish()
  }

  override fun onResume() {
    super.onResume()
    if (intent.getBooleanExtra(EXTRA_ADMIN_UNLOCK, false)) return
    GeoLockController.onLockActivityReady(this)
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    // Bloqueado en kiosco.
  }

  companion object {
    const val EXTRA_TITLE = "geo_title"
    const val EXTRA_MESSAGE = "geo_message"
    const val EXTRA_ADMIN_UNLOCK = "geo_admin_unlock"
  }
}
