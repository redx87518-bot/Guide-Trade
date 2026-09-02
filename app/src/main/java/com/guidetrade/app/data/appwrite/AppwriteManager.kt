package com.guidetrade.app.data.appwrite

import android.content.Context
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.services.Databases
import io.appwrite.services.Storage
import io.appwrite.services.Functions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

object AppwriteConfig {
    const val ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
    const val PROJECT_ID = "6a980c230037eb465e11"
    const val DATABASE_ID = "guide_trade"
}

class AppwriteManager private constructor(context: Context) {
    val client: Client = Client(
        context,
        AppwriteConfig.ENDPOINT,
        AppwriteConfig.PROJECT_ID
    )

    val account: Account = Account(client)
    val databases: Databases = Databases(client, AppwriteConfig.DATABASE_ID)
    val storage: Storage = Storage(client)
    val functions: Functions = Functions(client)

    private val _authState = MutableStateFlow(false)
    val authState: StateFlow<Boolean> = _authState

    init {
        checkAuthState()
    }

    private fun checkAuthState() {
        Thread {
            try {
                account.get()
                _authState.value = true
            } catch (e: Exception) {
                _authState.value = false
            }
        }.start()
    }

    companion object {
        @Volatile
        private var INSTANCE: AppwriteManager? = null

        fun getInstance(context: Context): AppwriteManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AppwriteManager(context.applicationContext).also {
                    INSTANCE = it
                }
            }
        }
    }
}
