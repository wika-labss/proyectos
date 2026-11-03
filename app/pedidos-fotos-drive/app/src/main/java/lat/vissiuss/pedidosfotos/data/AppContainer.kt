package lat.vissiuss.pedidosfotos.data

import android.content.Context
import lat.vissiuss.pedidosfotos.auth.GoogleAuthManager
import lat.vissiuss.pedidosfotos.drive.DriveRepository

class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    val sessionStore = SessionStore(appContext)
    val googleAuthManager = GoogleAuthManager(appContext)
    val driveRepository = DriveRepository()
}
