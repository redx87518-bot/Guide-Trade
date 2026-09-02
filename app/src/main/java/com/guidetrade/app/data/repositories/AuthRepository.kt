package com.guidetrade.app.data.repositories

import android.util.Log
import com.guidetrade.app.data.appwrite.AppwriteManager
import com.guidetrade.app.data.models.Profile
import io.appwrite.exceptions.AppwriteException
import io.appwrite.models.User
import kotlinx.coroutines.flow.Flow

class AuthRepository(private val appwrite: AppwriteManager) {

    fun observeAuthState(): Flow<Boolean> = appwrite.authState

    suspend fun createUser(email: String, password: String, name: String): Result<User<Map<String, Any>>> {
        return try {
            val user = appwrite.account.create(
                userId = "unique()",
                email = email,
                password = password,
                name = name
            )
            Result.success(user)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun signIn(email: String, password: String): Result<Unit> {
        return try {
            appwrite.account.createEmailSession(
                email = email,
                password = password
            )
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun signOut(): Result<Unit> {
        return try {
            appwrite.account.deleteSession("current")
            Result.success(Unit)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentUserProfile(): Result<Profile?> {
        return try {
            val user = appwrite.account.get()
            val prefs = try {
                appwrite.account.getPrefs<Map<String, Any>>()
            } catch (e: Exception) {
                null
            }
            val profile = prefs?.let {
                Profile(
                    userId = user.id,
                    name = user.name ?: "",
                    email = user.email ?: "",
                    avatarUrl = prefs["avatarUrl"] as? String ?: ""
                )
            }
            Result.success(profile)
        } catch (e: AppwriteException) {
            Result.failure(e)
        }
    }
}
