package lat.vissiuss.pedidosfotos.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.UserRecoverableAuthException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import lat.vissiuss.pedidosfotos.PedidosFotosApp
import lat.vissiuss.pedidosfotos.data.Aggregator
import java.io.File
import java.time.LocalDate
import java.time.format.DateTimeFormatter

data class UploadFormState(
    val aggregator: Aggregator = Aggregator.PEDIDOS_YA,
    val orderNumber: String = "",
    val useToday: Boolean = true,
    val customDate: String = "",
)

sealed interface UploadUiState {
    data object Idle : UploadUiState

    data class PreviewReady(val photoFile: File) : UploadUiState

    data class Uploading(val photoFile: File) : UploadUiState

    data class Success(val message: String) : UploadUiState

    data class Error(val message: String) : UploadUiState
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val container = (application as PedidosFotosApp).container

    val onboardingComplete =
        container.sessionStore.onboardingComplete.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5_000),
            false,
        )

    private val _signedInAccount = MutableStateFlow<GoogleSignInAccount?>(null)
    val signedInAccount: StateFlow<GoogleSignInAccount?> = _signedInAccount.asStateFlow()

    private val _onboardingMessage = MutableStateFlow<String?>(null)
    val onboardingMessage: StateFlow<String?> = _onboardingMessage.asStateFlow()

    private val _isVerifyingDrive = MutableStateFlow(false)
    val isVerifyingDrive: StateFlow<Boolean> = _isVerifyingDrive.asStateFlow()

    private val _driveAccessVerified = MutableStateFlow(false)
    val driveAccessVerified: StateFlow<Boolean> = _driveAccessVerified.asStateFlow()

    private val _form = MutableStateFlow(UploadFormState())
    val form: StateFlow<UploadFormState> = _form.asStateFlow()

    private val _uploadState = MutableStateFlow<UploadUiState>(UploadUiState.Idle)
    val uploadState: StateFlow<UploadUiState> = _uploadState.asStateFlow()

    init {
        refreshSignedInAccount()
    }

    fun refreshSignedInAccount() {
        _signedInAccount.value = container.googleAuthManager.getLastSignedInAccount()
    }

    fun onSignInResult(account: GoogleSignInAccount?) {
        _signedInAccount.value = account
        _onboardingMessage.value = null
    }

    fun verifyDriveAccess(onSuccess: () -> Unit) {
        val account = _signedInAccount.value
        if (account == null) {
            _onboardingMessage.value = "Inicia sesión con Google primero."
            return
        }
        if (!container.googleAuthManager.accountHasDriveScope(account)) {
            _onboardingMessage.value = "Falta el permiso de Google Drive. Vuelve a iniciar sesión y acepta el acceso."
            return
        }

        viewModelScope.launch {
            _isVerifyingDrive.value = true
            _onboardingMessage.value = null
            runCatching { container.googleAuthManager.getAccessToken(account) }
                .onSuccess { token ->
                    container.driveRepository.verifyAllFolders(token)
                        .onSuccess {
                            _driveAccessVerified.value = true
                            onSuccess()
                        }
                        .onFailure { error ->
                            _driveAccessVerified.value = false
                            _onboardingMessage.value = error.message
                        }
                }
                .onFailure { error ->
                    _driveAccessVerified.value = false
                    _onboardingMessage.value =
                        when (error) {
                            is UserRecoverableAuthException ->
                                "Vuelve a iniciar sesión y acepta el permiso de Google Drive."
                            else -> error.message ?: "No se pudo obtener acceso a Drive."
                        }
                }
            _isVerifyingDrive.value = false
        }
    }

    fun completeOnboarding() {
        viewModelScope.launch {
            container.sessionStore.setOnboardingComplete(true)
        }
    }

    fun resetOnboarding() {
        viewModelScope.launch {
            container.sessionStore.setOnboardingComplete(false)
            container.googleAuthManager.signOut()
            _signedInAccount.value = null
            _driveAccessVerified.value = false
            _uploadState.value = UploadUiState.Idle
            _form.value = UploadFormState()
        }
    }

    fun onPhotoCaptured(file: File) {
        if (!file.exists()) {
            _uploadState.value = UploadUiState.Error("No se pudo leer la foto capturada.")
            return
        }
        _uploadState.value = UploadUiState.PreviewReady(file)
    }

    fun updateAggregator(aggregator: Aggregator) {
        _form.update { it.copy(aggregator = aggregator) }
    }

    fun updateOrderNumber(value: String) {
        _form.update { it.copy(orderNumber = value) }
    }

    fun setUseToday(useToday: Boolean) {
        _form.update { it.copy(useToday = useToday) }
    }

    fun updateCustomDate(value: String) {
        _form.update { it.copy(customDate = value, useToday = false) }
    }

    fun useTodayDate() {
        _form.update {
            it.copy(
                useToday = true,
                customDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE),
            )
        }
    }

    fun uploadCurrentPhoto() {
        val state = _uploadState.value
        val account = _signedInAccount.value
        val form = _form.value

        if (state !is UploadUiState.PreviewReady) return
        if (account == null) {
            _uploadState.value = UploadUiState.Error("Sesión de Google expirada. Vuelve a iniciar sesión.")
            return
        }

        viewModelScope.launch {
            _uploadState.value = UploadUiState.Uploading(state.photoFile)
            val dateLabel =
                if (form.useToday) {
                    LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
                } else {
                    form.customDate.ifBlank { LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) }
                }

            runCatching { container.googleAuthManager.getAccessToken(account) }
                .onFailure { error ->
                    _uploadState.value =
                        UploadUiState.Error(
                            error.message ?: "No se pudo autenticar con Google Drive.",
                        )
                    return@launch
                }
                .onSuccess { token ->
                    container.driveRepository.uploadPhoto(
                        accessToken = token,
                        aggregator = form.aggregator,
                        orderNumber = form.orderNumber,
                        localFile = state.photoFile,
                        dateLabel = dateLabel,
                    ).onSuccess { link ->
                        _uploadState.value =
                            UploadUiState.Success(
                                "Foto subida como ${form.orderNumber.trim()}.jpg\n" +
                                    "Agregador: ${form.aggregator.displayName}\n" +
                                    "Fecha: $dateLabel\n$link",
                            )
                        state.photoFile.delete()
                        _form.value = UploadFormState()
                    }.onFailure { error ->
                        _uploadState.value =
                            UploadUiState.Error(error.message ?: "Error al subir la foto.")
                    }
                }
        }
    }

    fun discardPhoto() {
        val state = _uploadState.value
        if (state is UploadUiState.PreviewReady) {
            state.photoFile.delete()
        }
        _uploadState.value = UploadUiState.Idle
    }

    fun clearUploadMessage() {
        if (_uploadState.value is UploadUiState.Success || _uploadState.value is UploadUiState.Error) {
            _uploadState.value = UploadUiState.Idle
        }
    }
}
