package com.guidetrade.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.guidetrade.app.ui.screens.AuthScreen
import com.guidetrade.app.ui.screens.HistoryScreen
import com.guidetrade.app.ui.screens.HomeScreen
import com.guidetrade.app.ui.screens.ResearchScreen
import com.guidetrade.app.ui.screens.WatchlistScreen
import com.guidetrade.app.ui.screens.SettingsScreen
import com.guidetrade.app.ui.screens.ReportsScreen

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Research : Screen("research")
    object Watchlist : Screen("watchlist")
    object History : Screen("history")
    object Reports : Screen("reports")
    object Settings : Screen("settings")
    object Auth : Screen("auth")
}

@Composable
fun GuideTradeNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Auth.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(Screen.Auth.route) {
            AuthScreen(
                onAuthSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Home.route) {
            HomeScreen(
                navController = navController,
                onResearchRequest = { query ->
                    navController.navigate(Screen.Research.route + "?query=$query")
                }
            )
        }
        composable(Screen.Research.route + "?query={query}") {
            ResearchScreen(navController = navController)
        }
        composable(Screen.Watchlist.route) {
            WatchlistScreen(navController = navController)
        }
        composable(Screen.History.route) {
            HistoryScreen(navController = navController)
        }
        composable(Screen.Reports.route) {
            ReportsScreen(navController = navController)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
    }
}
