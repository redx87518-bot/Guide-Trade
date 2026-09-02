package com.guidetrade.app.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.guidetrade.app.ui.navigation.GuideTradeNavHost
import com.guidetrade.app.ui.navigation.Screen

@Composable
fun GuideTradeApp() {
    val navController = rememberNavController()
    Scaffold(
        bottomBar = {
            BottomNavigationBar(navController = navController)
        }
    ) { padding ->
        GuideTradeNavHost(
            modifier = Modifier.padding(padding),
            navController = navController
        )
    }
}
