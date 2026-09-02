package com.guidetrade.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guidetrade.app.data.repositories.AuthRepository
import com.guidetrade.app.data.repositories.UserRepository
import com.guidetrade.app.domain.usecases.FetchSettingsUseCase
import com.guidetrade.app.domain.usecases.SignOutUseCase
import com.guidetrade.app.domain.usecases.ObserveAuthStateUseCase
import com.guidetrade.app.domain.usecases.SignInUseCase
import com.guidetrade.app.domain.usecases.CreateWatchlistUseCase
import com.guidetrade.app.domain.usecases.FetchWatchlistsUseCase
import com.guidetrade.app.domain.usecases.SaveSettingsUseCase
import com.guidetrade.app.domain.usecases.CreateUserUseCase
import com.guidetrade.app.data.models.UserSettings
import com.guidetrade.app.data.models.Watchlist
import io.appwrite.exceptions.AppwriteException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null
)

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    init {
        observeAuthState()
    }

    private fun observeAuthState() {
        viewModelScope.launch {
            ObserveAuthStateUseCase(authRepository).invoke().collect { authenticated ->
                _uiState.value = _uiState.value.copy(isAuthenticated = authenticated)
            }
        }
    }

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = SignInUseCase(authRepository).invoke(email, password)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                error = result.exceptionOrNull()?.message
            )
        }
    }

    fun signUp(email: String, password: String, name: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = CreateUserUseCase(authRepository).invoke(email, password, name)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                error = result.exceptionOrNull()?.message
            )
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            SignOutUseCase(authRepository).invoke()
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }
}
