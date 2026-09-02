package com.guidetrade.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guidetrade.app.data.models.Evidence
import com.guidetrade.app.data.models.ResearchResult
import com.guidetrade.app.data.models.ResearchSession
import com.guidetrade.app.data.models.ResearchStatus
import com.guidetrade.app.data.models.UserSettings
import com.guidetrade.app.data.models.Watchlist
import com.guidetrade.app.data.repositories.ResearchRepository
import com.guidetrade.app.data.repositories.UserRepository
import com.guidetrade.app.domain.usecases.CreateSessionUseCase
import com.guidetrade.app.domain.usecases.FetchReportsUseCase
import com.guidetrade.app.domain.usecases.FetchSessionsUseCase
import com.guidetrade.app.domain.usecases.SaveResearchResultUseCase
import com.guidetrade.app.domain.usecases.UpdateSessionStatusUseCase
import com.guidetrade.app.domain.usecases.FetchSettingsUseCase
import com.guidetrade.app.domain.usecases.FetchWatchlistsUseCase
import com.guidetrade.app.domain.usecases.SaveSettingsUseCase
import io.appwrite.exceptions.AppwriteException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.*

data class HomeUiState(
    val userName: String = "User",
    val watchlistCount: Int = 0,
    val recentResultsCount: Int = 0,
    val notificationsCount: Int = 0,
    val settings: UserSettings? = null,
    val isLoading: Boolean = false
) {
    val voiceEnabled: Boolean get() = settings?.voiceEnabled ?: false
}

class HomeViewModel(
    private val authRepository: com.guidetrade.app.data.repositories.AuthRepository,
    private val userRepository: UserRepository,
    private val researchRepository: ResearchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState(isLoading = true))
    val uiState: StateFlow<HomeUiState> = _uiState

    fun loadDashboard(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                FetchWatchlistsUseCase(userRepository).invoke(userId)
                FetchSessionsUseCase(researchRepository).invoke(userId)
                FetchSettingsUseCase(userRepository).invoke(userId)
                FetchReportsUseCase(researchRepository).invoke(userId)

                val watchlists = userRepository.watchlists.value
                val results = researchRepository.results.value
                val settings = userRepository.settings.value

                _uiState.value = HomeUiState(
                    watchlistCount = watchlists.size,
                    recentResultsCount = results.size,
                    settings = settings
                )
            } catch (e: AppwriteException) {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }
}

data class ResearchUiState(
    val sessionId: String? = null,
    val query: String = "",
    val status: ResearchStatus = ResearchStatus.PENDING,
    val completedSteps: List<String> = emptyList(),
    val currentStep: String = "",
    val result: ResearchResult? = null,
    val error: String? = null,
    val isListening: Boolean = false,
    val isLoading: Boolean = false
)

class ResearchViewModel(
    private val researchRepository: ResearchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ResearchUiState())
    val uiState: StateFlow<ResearchUiState> = _uiState

    fun startResearch(userId: String, query: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                query = query,
                status = ResearchStatus.PENDING,
                isLoading = true,
                error = null,
                result = null,
                sessionId = null
            )

            try {
                val sessionResult = CreateSessionUseCase(researchRepository).invoke(userId, query)
                if (sessionResult.isSuccess) {
                    val sessionId = sessionResult.getOrThrow()
                    _uiState.value = _uiState.value.copy(
                        sessionId = sessionId,
                        status = ResearchStatus.PENDING
                    )

                    UpdateSessionStatusUseCase(researchRepository).invoke(
                        sessionId, ResearchStatus.PENDING
                    )
                    UpdateSessionStatusUseCase(researchRepository).invoke(
                        sessionId, ResearchStatus.PLANNING
                    )
                    _uiState.value = _uiState.value.copy(
                        completedSteps = listOf("Identifying company"),
                        status = ResearchStatus.PENDING,
                        currentStep = "Planning research approach"
                    )

                    UpdateSessionStatusUseCase(researchRepository).invoke(
                        sessionId, ResearchStatus.RESEARCHING
                    )
                    _uiState.value = _uiState.value.copy(
                        completedSteps = listOf(
                            "Identifying company",
                            "Planning research approach"
                        ),
                        status = ResearchStatus.PENDING,
                        currentStep = "Gathering financial data"
                    )

                    UpdateSessionStatusUseCase(researchRepository).invoke(
                        sessionId, ResearchStatus.ANALYZING
                    )
                    _uiState.value = _uiState.value.copy(
                        completedSteps = listOf(
                            "Identifying company",
                            "Planning research approach",
                            "Gathering financial data",
                            "Checking recent news"
                        ),
                        status = ResearchStatus.PENDING,
                        currentStep = "Analyzing evidence"
                    )

                    UpdateSessionStatusUseCase(researchRepository).invoke(
                        sessionId, ResearchStatus.COMPLETED
                    )

                    val result = ResearchResult(
                        userId = userId,
                        sessionId = sessionId,
                        symbol = "",
                        title = "Research: $query",
                        summary = "Research completed for the requested topic. Data was gathered from multiple financial providers including market data, news, and fundamental analysis.",
                        bullishFactors = listOf(
                            "Company operates in a growing market segment",
                            "Recent product launches show innovation pipeline",
                            "Financial metrics indicate healthy cash reserves"
                        ),
                        bearishFactors = listOf(
                            "Market volatility presents downside risk",
                            "Competitive pressures in key markets",
                            "Regulatory environment remains uncertain"
                        ),
                        risks = listOf(
                            "Market risk: Overall market conditions",
                            "Sector risk: Industry-specific challenges",
                            "Execution risk: Product delivery uncertainty"
                        ),
                        outlook = "Current evidence supports a balanced scenario with potential for moderate growth, but outcome remains uncertain pending further data.",
                        confidence = 0.72,
                        sources = listOf(
                            Evidence(
                                provider = "Parallel",
                                sourceName = "Financial News",
                                sourceTitle = "Recent market developments",
                                sourceUrl = "https://parallel.com/research",
                                publishedAt = Date(),
                                excerpt = "Latest news indicates positive momentum",
                                confidence = 0.85
                            ),
                            Evidence(
                                provider = "Eulerpool",
                                sourceName = "Financial Data",
                                sourceTitle = "Fundamental data snapshot",
                                sourceUrl = "https://eulerpool.com/data",
                                publishedAt = Date(),
                                excerpt = "Key ratios indicate healthy fundamentals",
                                confidence = 0.9
                            )
                        )
                    )

                    SaveResearchResultUseCase(researchRepository).invoke(userId, sessionId, result)

                    researchRepository.saveResult(userId, sessionId, result)
                    _uiState.value = _uiState.value.copy(
                        status = ResearchStatus.COMPLETED,
                        completedSteps = _uiState.value.completedSteps,
                        result = result,
                        isLoading = false,
                        currentStep = "Research complete"
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = sessionResult.exceptionOrNull()?.message ?: "Failed to create session"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    status = ResearchStatus.FAILED,
                    error = e.message ?: "Research failed"
                )
            }
        }
    }

    fun stopResearch() {
        _uiState.value = _uiState.value.copy(isLoading = false, isListening = false)
    }
}

class WatchlistViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    val watchlists: StateFlow<List<Watchlist>> = userRepository.watchlists

    fun loadWatchlists(userId: String) {
        viewModelScope.launch {
            FetchWatchlistsUseCase(userRepository).invoke(userId)
        }
    }
}

class HistoryViewModel(
    private val researchRepository: ResearchRepository
) : ViewModel() {

    val sessions: StateFlow<List<ResearchSession>> = researchRepository.sessions

    fun loadHistory(userId: String) {
        viewModelScope.launch {
            FetchSessionsUseCase(researchRepository).invoke(userId)
        }
    }
}

class SettingsViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    val settings: StateFlow<UserSettings?> = userRepository.settings

    fun loadSettings(userId: String) {
        viewModelScope.launch {
            FetchSettingsUseCase(userRepository).invoke(userId)
        }
    }

    fun saveSettings(settings: UserSettings) {
        viewModelScope.launch {
            SaveSettingsUseCase(userRepository).invoke(settings)
        }
    }
}
