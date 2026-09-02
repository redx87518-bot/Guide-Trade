package com.guidetrade.app.domain.usecases

import com.guidetrade.app.data.repositories.AuthRepository
import com.guidetrade.app.data.repositories.ResearchRepository
import com.guidetrade.app.data.repositories.UserRepository
import com.guidetrade.app.data.models.ResearchResult
import com.guidetrade.app.data.models.ResearchStatus
import com.guidetrade.app.data.models.UserSettings
import com.guidetrade.app.data.models.Watchlist
import io.appwrite.exceptions.AppwriteException
import kotlinx.coroutines.flow.Flow
import java.util.Date

class CreateUserUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(
        email: String,
        password: String,
        name: String
    ): Result<Unit> = authRepository.createUser(email, password, name)
}

class SignInUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): Result<Unit> =
        authRepository.signIn(email, password)
}

class SignOutUseCase(private val authRepository: AuthRepository) {
    suspend operator fun invoke(): Result<Unit> = authRepository.signOut()
}

class ObserveAuthStateUseCase(private val authRepository: AuthRepository) {
    operator fun invoke(): Flow<Boolean> = authRepository.observeAuthState()
}

class CreateSessionUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(userId: String, query: String): Result<String> =
        researchRepository.createSession(userId, query)
}

class UpdateSessionStatusUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(sessionId: String, status: ResearchStatus) =
        researchRepository.updateSessionStatus(sessionId, status)
}

class SaveResearchResultUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(
        userId: String,
        sessionId: String,
        result: ResearchResult
    ): Result<Unit> = researchRepository.saveResult(userId, sessionId, result)
}

class CreateWatchlistUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(
        userId: String,
        name: String,
        symbols: List<String>
    ): Result<String> = userRepository.createWatchlist(userId, name, symbols)
}

class FetchWatchlistsUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(userId: String) =
        userRepository.fetchWatchlists(userId)
}

class UpdateWatchlistSymbolsUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(
        watchlistId: String,
        symbols: List<String>
    ): Result<Unit> = userRepository.updateWatchlistSymbols(watchlistId, symbols)
}

class DeleteWatchlistUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(watchlistId: String): Result<Unit> =
        userRepository.deleteWatchlist(watchlistId)
}

class FetchSettingsUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(userId: String) =
        userRepository.fetchSettings(userId)
}

class SaveSettingsUseCase(private val userRepository: UserRepository) {
    suspend operator fun invoke(settings: UserSettings): Result<Unit> =
        userRepository.saveSettings(settings)
}

class FetchSessionsUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(userId: String) =
        researchRepository.fetchUserSessions(userId)
}

class FetchReportsUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(userId: String) =
        researchRepository.fetchSavedReports(userId)
}

class FetchNotificationsUseCase(private val researchRepository: ResearchRepository) {
    suspend operator fun invoke(userId: String) =
        researchRepository.fetchNotifications(userId)
}
