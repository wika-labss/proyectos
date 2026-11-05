package lat.vissiuss.pedidosfotos.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.signin.GoogleSignInAccount

@Composable
fun OnboardingScreen(
    signedInAccount: GoogleSignInAccount?,
    driveAccessVerified: Boolean,
    isVerifying: Boolean,
    message: String?,
    onSignInClick: () -> Unit,
    onVerifyClick: () -> Unit,
    onContinueAfterCameraGranted: () -> Unit,
    cameraGranted: Boolean,
    onRequestCamera: () -> Unit,
) {
    Column(
        modifier =
            Modifier
                .fillMaxSize()
                .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "Pedidos Fotos",
            style = MaterialTheme.typography.headlineMedium,
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text =
                "Antes de usar la cámara debes iniciar sesión con Google y " +
                    "confirmar acceso a las carpetas de PedidosYa y Uber en Drive.",
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (signedInAccount == null) {
            Button(onClick = onSignInClick, modifier = Modifier.fillMaxWidth()) {
                Text("Continuar con Google")
            }
        } else {
            Text(
                text = "Cuenta: ${signedInAccount.email ?: signedInAccount.displayName ?: "Google"}",
                style = MaterialTheme.typography.bodyLarge,
            )
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onVerifyClick,
                enabled = !isVerifying,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (isVerifying) {
                    CircularProgressIndicator()
                } else {
                    Text("Comprobar acceso a carpetas Drive")
                }
            }
        }

        if (driveAccessVerified && !cameraGranted) {
            Spacer(modifier = Modifier.height(12.dp))
            Text("Acceso a carpetas PedidosYa y Uber confirmado.", textAlign = TextAlign.Center)
            OutlinedButton(onClick = onRequestCamera, modifier = Modifier.fillMaxWidth()) {
                Text("Permitir cámara")
            }
        }

        if (driveAccessVerified && cameraGranted && signedInAccount != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = onContinueAfterCameraGranted, modifier = Modifier.fillMaxWidth()) {
                Text("Entrar a la app")
            }
        }

        message?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = it, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
        }
    }
}
