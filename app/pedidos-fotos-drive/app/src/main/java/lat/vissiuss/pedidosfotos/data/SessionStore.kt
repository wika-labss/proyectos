package lat.vissiuss.pedidosfotos.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

class SessionStore(private val context: Context) {
    private val onboardingCompleteKey = booleanPreferencesKey("onboarding_complete")

    val onboardingComplete: Flow<Boolean> =
        context.dataStore.data.map { prefs -> prefs[onboardingCompleteKey] == true }

    suspend fun setOnboardingComplete(complete: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[onboardingCompleteKey] = complete
        }
    }
}
