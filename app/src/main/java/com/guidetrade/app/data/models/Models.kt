package com.guidetrade.app.data.models

import java.util.Date

data class Profile(
    val userId: String = "",
    val name: String = "",
    val email: String = "",
    val avatarUrl: String = "",
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
)

data class Watchlist(
    val id: String = "",
    val userId: String = "",
    val name: String,
    val symbols: List<String> = emptyList(),
    val createdAt: Date = Date()
)

data class ResearchSession(
    val id: String = "",
    val userId: String = "",
    val query: String,
    val status: ResearchStatus = ResearchStatus.PENDING,
    val startedAt: Date = Date(),
    val completedAt: Date? = null
)

enum class ResearchStatus {
    PENDING, PLANNING, RESEARCHING, ANALYZING, COMPLETED, FAILED
}

data class ResearchResult(
    val id: String = "",
    val userId: String = "",
    val sessionId: String = "",
    val symbol: String = "",
    val title: String,
    val summary: String,
    val bullishFactors: List<String> = emptyList(),
    val bearishFactors: List<String> = emptyList(),
    val risks: List<String> = emptyList(),
    val outlook: String,
    val confidence: Double,
    val sources: List<Evidence>,
    val createdAt: Date = Date()
)

data class Evidence(
    val provider: String,
    val sourceName: String,
    val sourceTitle: String,
    val sourceUrl: String,
    val publishedAt: Date? = null,
    val retrievedAt: Date = Date(),
    val excerpt: String,
    val confidence: Double
)

data class SavedReport(
    val id: String = "",
    val userId: String = "",
    val researchId: String,
    val title: String,
    val fileId: String,
    val createdAt: Date = Date()
)

data class UserSettings(
    val id: String = "",
    val userId: String = "",
    val voiceEnabled: Boolean = false,
    val autoReadResearch: Boolean = true,
    val elevenLabsApiKey: String = "",
    val elevenLabsVoiceId: String = "",
    val telegramEnabled: Boolean = false,
    val telegramBotToken: String = "",
    val telegramChatId: String = "",
    val discordEnabled: Boolean = false,
    val discordWebhookUrl: String = ""
)

data class Notification(
    val id: String = "",
    val userId: String = "",
    val type: NotificationType,
    val title: String,
    val message: String,
    val read: Boolean = false,
    val createdAt: Date = Date()
)

enum class NotificationType {
    RESEARCH_COMPLETE,
    WATCHLIST_ALERT,
    SYSTEM
}

sealed class ResearchUiState {
    object Idle : ResearchUiState()
    object Planning : ResearchUiState()
    data class Researching(val step: String, val completed: List<String>) : ResearchUiState()
    data class Completed(val result: ResearchResult) : ResearchUiState()
    data class Error(val message: String) : ResearchUiState()
}
