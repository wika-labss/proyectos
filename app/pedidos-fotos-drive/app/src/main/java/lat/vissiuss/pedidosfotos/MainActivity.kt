package lat.vissiuss.pedidosfotos

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException
import lat.vissiuss.pedidosfotos.ui.MainViewModel
import lat.vissiuss.pedidosfotos.ui.UploadUiState
import lat.vissiuss.pedidosfotos.ui.camera.CameraScreen
import lat.vissiuss.pedidosfotos.ui.form.UploadFormScreen
import lat.vissiuss.pedidosfotos.ui.onboarding.OnboardingScreen

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
    private val cameraGranted = mutableStateOf(false)

    private val signInLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                viewModel.onSignInResult(account)
            } catch (_: ApiException) {
                viewModel.onSignInResult(null)
            }
        }

    private val cameraPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            cameraGranted.value = granted
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraGranted.value = hasCameraPermission()

        setContent {
            val granted by cameraGranted
            MaterialTheme(colorScheme = lightColorScheme()) {
                PedidosFotosRoot(
                    viewModel = viewModel,
                    cameraGranted = granted,
                    onSignInClick = {
                        val client =
                            (application as PedidosFotosApp).container.googleAuthManager.buildSignInClient()
                        signInLauncher.launch(client.signInIntent)
                    },
                    onRequestCamera = {
                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                    },
                    onResetSession = { viewModel.resetOnboarding() },
                )
            }
        }
    }

    private fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PedidosFotosRoot(
    viewModel: MainViewModel,
    cameraGranted: Boolean,
    onSignInClick: () -> Unit,
    onRequestCamera: () -> Unit,
    onResetSession: () -> Unit,
) {
    val onboardingComplete by viewModel.onboardingComplete.collectAsStateWithLifecycle()
    val signedInAccount by viewModel.signedInAccount.collectAsStateWithLifecycle()
    val driveAccessVerified by viewModel.driveAccessVerified.collectAsStateWithLifecycle()
    val isVerifying by viewModel.isVerifyingDrive.collectAsStateWithLifecycle()
    val onboardingMessage by viewModel.onboardingMessage.collectAsStateWithLifecycle()
    val form by viewModel.form.collectAsStateWithLifecycle()
    val uploadState by viewModel.uploadState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pedidos Fotos") },
                actions = {
                    if (onboardingComplete) {
                        TextButton(onClick = onResetSession) {
                            Text("Cerrar sesión")
                        }
                    }
                },
            )
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                !onboardingComplete -> {
                    OnboardingScreen(
                        signedInAccount = signedInAccount,
                        driveAccessVerified = driveAccessVerified,
                        isVerifying = isVerifying,
                        message = onboardingMessage,
                        onSignInClick = onSignInClick,
                        onVerifyClick = { viewModel.verifyDriveAccess {} },
                        onContinueAfterCameraGranted = { viewModel.completeOnboarding() },
                        cameraGranted = cameraGranted,
                        onRequestCamera = onRequestCamera,
                    )
                }

                uploadState is UploadUiState.PreviewReady || uploadState is UploadUiState.Uploading -> {
                    UploadFormScreen(
                        form = form,
                        uploadState = uploadState,
                        onAggregatorChange = viewModel::updateAggregator,
                        onOrderNumberChange = viewModel::updateOrderNumber,
                        onUseToday = viewModel::useTodayDate,
                        onCustomDateChange = viewModel::updateCustomDate,
                        onUpload = viewModel::uploadCurrentPhoto,
                        onDiscard = viewModel::discardPhoto,
                    )
                }

                else -> {
                    CameraScreen(onPhotoCaptured = viewModel::onPhotoCaptured)
                    when (val state = uploadState) {
                        is UploadUiState.Success -> {
                            Text(
                                text = state.message,
                                modifier = Modifier.padding(16.dp),
                            )
                            TextButton(onClick = { viewModel.clearUploadMessage() }) {
                                Text("Tomar otra foto")
                            }
                        }

                        is UploadUiState.Error -> {
                            Text(
                                text = state.message,
                                modifier = Modifier.padding(16.dp),
                            )
                            TextButton(onClick = { viewModel.clearUploadMessage() }) {
                                Text("Reintentar")
                            }
                        }

                        else -> Unit
                    }
                }
            }
        }
    }
}
