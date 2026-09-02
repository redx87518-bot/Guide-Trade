package com.guidetrade.app.data.repositories

import android.util.Log
import com.guidetrade.app.data.appwrite.AppwriteConfig
import com.guidetrade.app.data.appwrite.AppwriteManager
import com.guidetrade.app.data.models.Evidence
import com.guidetrade.app.data.models.ResearchResult
import com.guidetrade.app.data.models.ResearchSession
import com.guidetrade.app.data.models.ResearchStatus
import com.guidetrade.app.data.models.SavedReport
import com.guidetrade.app.data.models.UserSettings
import com.guidetrade.app.data.models.Watchlist
import com.guidetrade.app.data.models.Notification
import com.guidetrade.app.data.models.NotificationType
import io.appwrite.exceptions.AppwriteException
import io.appwrite.models.DocumentList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.Date

class ResearchRepository(private val appwrite: AppwriteManager) {

    private val _sessions = MutableStateFlow<List<ResearchSession>>(emptyList())
    val sessions: StateFlow<List<ResearchSession>> = _sessions

    private val _results = MutableStateFlow<List<ResearchResult>>(emptyList())
    val results: StateFlow<List<ResearchResult>> = _results

    private val _reports = MutableStateFlow<List<SavedReport>>(emptyList())
    val reports: StateFlow<List<SavedReport>> = _reports

    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications

    suspend fun createSession(userId: String, query: String): Result<String> {
        return try {
            val document = appwrite.databases.createDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "research_sessions",
                documentId = "unique()",
                data = mapOf(
                    "userId" to userId,
                    "query" to query,
                    "status" to ResearchStatus.PENDING.name,
                    "startedAt" to System.currentTimeMillis()
                )
            )
            Result.success(document.id)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun updateSessionStatus(sessionId: String, status: ResearchStatus) {
        try {
            appwrite.databases.updateDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "research_sessions",
                documentId = sessionId,
                data = mapOf("status" to status.name)
            )
        } catch (e: AppwriteException) {
            Log.e("ResearchRepo", "Failed to update session: ${e.message}")
        }
    }

    suspend fun saveResult(
        userId: String,
        sessionId: String,
        result: ResearchResult
    ): Result<Unit> {
        return try {
            appwrite.databases.createDocument(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "research_results",
                documentId = "unique()",
                data = mapOf(
                    "userId" to userId,
                    "sessionId" to sessionId,
                    "symbol" to result.symbol,
                    "title" to result.title,
                    "summary" to result.summary,
                    "bullishFactors" to result.bullishFactors,
                    "bearishFactors" to result.bearishFactors,
                    "risks" to result.risks,
                    "outlook" to result.outlook,
                    "confidence" to result.confidence,
                    "sources" to result.sources.map { evidence ->
                        mapOf(
                            "provider" to evidence.provider,
                            "sourceName" to evidence.sourceName,
                            "sourceTitle" to evidence.sourceTitle,
                            "sourceUrl" to evidence.sourceUrl,
                            "publishedAt" to evidence.publishedAt?.time,
                            "retrievedAt" to evidence.retrievedAt.time,
                            "excerpt" to evidence.excerpt,
                            "confidence" to evidence.confidence
                        )
                    }
                )
            )
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun fetchUserSessions(userId: String) {
        try {
            val documents = appwrite.databases.listDocuments(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "research_sessions",
                queries = listOf("equal(userId, '$userId')")
            )
            _sessions.value = documents.documents.map { doc ->
                ResearchSession(
                    id = doc.id,
                    userId = doc.data["userId"] as? String ?: "",
                    query = doc.data["query"] as? String ?: "",
                    status = ResearchStatus.valueOf(
                        doc.data["status"] as? String ?: ResearchStatus.PENDING.name
                    ),
                    startedAt = Date((doc.data["startedAt"] as? Long) ?: System.currentTimeMillis()),
                    completedAt = (doc.data["completedAt"] as? Long)?.let { Date(it) }
                )
            }.sortedByDescending { it.startedAt }
        } catch (e: AppwriteException) {
            Log.e("ResearchRepo", "Failed to fetch sessions: ${e.message}")
        }
    }

    suspend fun fetchSavedReports(userId: String) {
        try {
            val documents = appwrite.databases.listDocuments(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "saved_reports",
                queries = listOf("equal(userId, '$userId')")
            )
            _reports.value = documents.documents.map { doc ->
                SavedReport(
                    id = doc.id,
                    userId = doc.data["userId"] as? String ?: "",
                    researchId = doc.data["researchId"] as? String ?: "",
                    title = doc.data["title"] as? String ?: "",
                    fileId = doc.data["fileId"] as? String ?: "",
                    createdAt = Date((doc.data["\$createdAt"] as? Long) ?: System.currentTimeMillis())
                 )
             }.sortedByDescending { it.createdAt }
        } catch (e: AppwriteException) {
            Log.e("ResearchRepo", "Failed to fetch reports: ${e.message}")
        }
    }

    suspend fun fetchNotifications(userId: String) {
        try {
            val documents = appwrite.databases.listDocuments(
                databaseId = AppwriteConfig.DATABASE_ID,
                collectionId = "notifications",
                queries = listOf("equal(userId, '$userId')")
            )
            _notifications.value = documents.documents.map { doc ->
                Notification(
                    id = doc.id,
                    userId = doc.data["userId"] as? String ?: "",
                    type = NotificationType.valueOf(
                        doc.data["type"] as? String ?: NotificationType.SYSTEM.name
                    ),
                    title = doc.data["title"] as? String ?: "",
                    message = doc.data["message"] as? String ?: "",
                     read = doc.data["read"] as? Boolean ?: false,
                     createdAt = Date((doc.data["\$createdAt"] as? Long) ?: System.currentTimeMillis())
                     )
             }.sortedByDescending { it.createdAt }
        } catch (e: AppwriteException) {
            Log.e("ResearchRepo", "Failed to fetch notifications: ${e.message}")
        }
    }
}
