package com.guidetrade.app.data.repositories

import android.util.Log
import com.guidetrade.app.data.appwrite.AppwriteConfig
import com.guidetrade.app.data.appwrite.AppwriteManager
import com.guidetrade.app.data.models.UserSettings
import com.guidetrade.app.data.models.Watchlist
import io.appwrite.ID
import io.appwrite.exceptions.AppwriteException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.Date

class UserRepository(private val appwrite: AppwriteManager) {

    private val _watchlists = MutableStateFlow<List<Watchlist>>(emptyList())
    val watchlists: StateFlow<List<Watchlist>> = _watchlists

    private val _settings = MutableStateFlow<UserSettings?>(null)
    val settings: StateFlow<UserSettings?> = _settings

    suspend fun createWatchlist(userId: String, name: String, symbols: List<String>): Result<String> {
        return try {
            val document = appwrite.databases.createDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "watchlists",
                 documentId = ID.unique(),
                data = mapOf(
                    "userId" to userId,
                    "name" to name,
                    "symbols" to symbols,
                    "createdAt" to System.currentTimeMillis()
                )
            )
            Result.success(document.id)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun fetchWatchlists(userId: String) {
        try {
            val documents = appwrite.databases.listDocuments(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "watchlists",
                queries = listOf("equal(userId, '$userId')")
            )
            _watchlists.value = documents.documents.map { doc ->
                Watchlist(
                    id = doc.id,
                    userId = doc.data["userId"] as? String ?: "",
                    name = doc.data["name"] as? String ?: "",
                    symbols = (doc.data["symbols"] as? List<*>)
                        ?.filterIsInstance<String>()
                        ?: emptyList(),
                    createdAt = Date((doc.data["createdAt"] as? Long) ?: System.currentTimeMillis())
                )
            }.sortedByDescending { it.createdAt }
        } catch (e: AppwriteException) {
            Log.e("UserRepo", "Failed to fetch watchlists: ${e.message}")
        }
    }

    suspend fun updateWatchlistSymbols(watchlistId: String, symbols: List<String>): Result<Unit> {
        return try {
            appwrite.databases.updateDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "watchlists",
                documentId = watchlistId,
                data = mapOf("symbols" to symbols)
            )
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun deleteWatchlist(watchlistId: String): Result<Unit> {
        return try {
            appwrite.databases.deleteDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "watchlists",
                documentId = watchlistId
            )
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun fetchSettings(userId: String) {
        try {
            val document = appwrite.databases.getDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "user_settings",
                documentId = userId
            )
            _settings.value = UserSettings(
                id = document.id,
                userId = document.data["userId"] as? String ?: userId,
                voiceEnabled = document.data["voiceEnabled"] as? Boolean ?: false,
                autoReadResearch = document.data["autoReadResearch"] as? Boolean ?: true,
                elevenLabsApiKey = document.data["elevenLabsApiKey"] as? String ?: "",
                elevenLabsVoiceId = document.data["elevenLabsVoiceId"] as? String ?: "",
                telegramEnabled = document.data["telegramEnabled"] as? Boolean ?: false,
                telegramBotToken = document.data["telegramBotToken"] as? String ?: "",
                telegramChatId = document.data["telegramChatId"] as? String ?: "",
                discordEnabled = document.data["discordEnabled"] as? Boolean ?: false,
                discordWebhookUrl = document.data["discordWebhookUrl"] as? String ?: ""
            )
        } catch (e: AppwriteException) {
            _settings.value = UserSettings(userId = userId)
        }
    }

    suspend fun saveSettings(settings: UserSettings): Result<Unit> {
        return try {
            val data = mapOf(
                "userId" to settings.userId,
                "voiceEnabled" to settings.voiceEnabled,
                "autoReadResearch" to settings.autoReadResearch,
                "elevenLabsApiKey" to settings.elevenLabsApiKey,
                "elevenLabsVoiceId" to settings.elevenLabsVoiceId,
                "telegramEnabled" to settings.telegramEnabled,
                "telegramBotToken" to settings.telegramBotToken,
                "telegramChatId" to settings.telegramChatId,
                "discordEnabled" to settings.discordEnabled,
                "discordWebhookUrl" to settings.discordWebhookUrl
            )
            try {
                appwrite.databases.createDocument(
                    databaseId = AppwriteConfig.DATABASE_ID,
                    collectionId = "user_settings",
                    documentId = settings.userId,
                    data = data,
                    permissions = listOf("read(\"user:${settings.userId}\")", "write(\"user:${settings.userId}\")")
                )
            } catch (e: AppwriteException) {
                appwrite.databases.updateDocument(
                    databaseId = AppwriteConfig.DATABASE_ID,
                    collectionId = "user_settings",
                    documentId = settings.userId,
                    data = data
                )
            }
            _settings.value = settings
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }
}
