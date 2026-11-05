package lat.vissiuss.pedidosfotos.auth

import android.content.Context
import com.google.android.gms.auth.GoogleAuthUtil
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.Scope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GoogleAuthManager(private val context: Context) {
    private val driveFileScopeUrl = "https://www.googleapis.com/auth/drive.file"
    private val driveScope = Scope(driveFileScopeUrl)
    private val driveScopeString = "oauth2:$driveFileScopeUrl"

    fun buildSignInClient(): GoogleSignInClient {
        val options =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(driveScope)
                .build()
        return GoogleSignIn.getClient(context, options)
    }

    fun getLastSignedInAccount(): GoogleSignInAccount? {
        return GoogleSignIn.getLastSignedInAccount(context)
    }

    fun accountHasDriveScope(account: GoogleSignInAccount): Boolean {
        return GoogleSignIn.hasPermissions(account, driveScope)
    }

    suspend fun getAccessToken(account: GoogleSignInAccount): String =
        withContext(Dispatchers.IO) {
            val email =
                account.email
                    ?: error("La cuenta de Google no tiene email disponible.")
            @Suppress("DEPRECATION")
            GoogleAuthUtil.getToken(context, email, driveScopeString)
        }

    suspend fun signOut() {
        buildSignInClient().signOut()
    }
}
