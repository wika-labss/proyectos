package lat.vissiuss.pedidosfotos

import android.app.Application
import lat.vissiuss.pedidosfotos.data.AppContainer

class PedidosFotosApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
