package com.guidetrade.app.ui.theme

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.TextUnitType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Purple80 = Color(0xFFB39DDB)
private val Purple40 = Color(0xFF7B1FA2)

private val DarkBackground = Color(0xFF0F0F12)
private val DarkSurface = Color(0xFF1A1A20)
private val DarkOnSurface = Color(0xFFE0E0E3)
private val DarkOnSurfaceVariant = Color(0xFFA0A0AB)

private val LightBackground = Color(0xFFFAFAFC)
private val LightSurface = Color(0xFFFFFFFF)
private val LightOnSurface = Color(0xFF1A1A1D)
private val LightOnSurfaceVariant = Color(0xFF6B6B76)

val GradientStart = Color(0xFF6366F1)
val GradientEnd = Color(0xFF8B5CF6)

val GuideTradeColorScheme = lightColorScheme(
    primary = Purple40,
    onPrimary = Color.White,
    secondary = Purple40.copy(alpha = 0.8f),
    onSecondary = Color.White,
    tertiary = Color(0xFFE91E63),
    background = LightBackground,
    surface = LightSurface,
    onSurface = LightOnSurface,
    onSurfaceVariant = LightOnSurfaceVariant,
)

val GuideTradeDarkColorScheme = darkColorScheme(
    primary = Purple80,
    onPrimary = Color(0xFF121214),
    secondary = Purple80.copy(alpha = 0.8f),
    onSecondary = Color(0xFF121214),
    tertiary = Color(0xFFF06292),
    background = DarkBackground,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    onSurfaceVariant = DarkOnSurfaceVariant,
)

val AppTypography = Typography()

enum class OrbState {
    Idle, Listening, Thinking, Speaking, Error
}

@Composable
fun GuideTradeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = GuideTradeColorScheme,
        typography = AppTypography,
        content = content
    )
}
