package com.wika.geoempresa

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity

class SecurityLockActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    window.addFlags(
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
    )

    val title = intent.getStringExtra(EXTRA_TITLE) ?: "Alerta Geo Empresa"
    val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "Ingresa el PIN corporativo en la app."

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
      inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD
    }

    val unlockButton = Button(this).apply {
      text = "Desbloquear"
      setOnClickListener {
        if (pinInput.text.toString() == DEFAULT_PIN) {
          finish()
        }
      }
    }

    layout.addView(titleView)
    layout.addView(messageView)
    layout.addView(pinInput)
    layout.addView(unlockButton)
    setContentView(layout)
  }

  override fun onBackPressed() {
    // Block back navigation while locked.
  }

  companion object {
    const val EXTRA_TITLE = "geo_title"
    const val EXTRA_MESSAGE = "geo_message"
    private const val DEFAULT_PIN = "1312"
  }
}
