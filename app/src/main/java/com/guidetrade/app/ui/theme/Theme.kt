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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.TextUnitType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

private val Purple80 = Color(0xFFB39DDB)
private val PurpleGrey80 = Color(0xFFC5CAE9)
private val Pink80 = Color(0xFFF06292)

private val Purple40 = Color(0xFF7B1FA2)
private val PurpleGrey40 = Color(0xFF9575CD)
private val Pink40 = Color(0xFFE91E63)

private val DarkBackground = Color(0xFF0F0F12)
private val DarkSurface = Color(0xFF1A1A20)
private val DarkSurfaceVariant = Color(0xFF2A2A35)
private val DarkOnSurface = Color(0xFFE0E0E3)
private val DarkOnSurfaceVariant = Color(0xFFA0A0AB)

private val LightBackground = Color(0xFFFAFAFC)
private val LightSurface = Color(0xFFFFFFFF)
private val LightSurfaceVariant = Color(0xFFF0F0F5)
private val LightOnSurface = Color(0xFF1A1A1D)
private val LightOnSurfaceVariant = Color(0xFF6B6B76)

val GradientStart = Color(0xFF6366F1)
val GradientEnd = Color(0xFF8B5CF6)

val GuideTradeColorScheme = lightColorScheme(
    primary = Purple40,
    onPrimary = Color.White,
    secondary = PurpleGrey40,
    onSecondary = Color.White,
    tertiary = Pink40,
    background = LightBackground,
    surface = LightSurface,
    onSurface = LightOnSurface,
    onSurfaceVariant = LightOnSurfaceVariant,
    surfaceVariant = LightSurfaceVariant,
)

val GuideTradeDarkColorScheme = darkColorScheme(
    primary = Purple80,
    onPrimary = Color(0xFF121214),
    secondary = PurpleGrey80,
    onSecondary = Color(0xFF121214),
    tertiary = Pink80,
    background = DarkBackground,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    onSurfaceVariant = DarkOnSurfaceVariant,
    surfaceVariant = DarkSurfaceVariant,
)

val Typography = androidx.compose.material3.Typography()

@Composable
fun GuideTradeTheme(
    content: @Composable () -> Unit
) {
    val colors = GuideTradeColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}

enum class OrbState {
    Idle, Listening, Thinking, Speaking, Error
}

@Composable
fun Orb(
    state: OrbState = OrbState.Idle,
    modifier: Modifier = Modifier,
    size: Float = 120f,
    onOrbClick: () -> Unit = {}
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Box(
        modifier = modifier
            .size((size * pulse).dp)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        GradientStart.copy(alpha = 0.8f),
                        GradientEnd.copy(alpha = 0.5f)
                    )
                )
            )
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
        ) {
            drawCircle(
                color = Color.White.copy(alpha = 0.15f),
                radius = size / 6,
                style = Stroke(
                    width = 4f,
                    cap = StrokeCap.Round
                )
            )
        }
    }
}
