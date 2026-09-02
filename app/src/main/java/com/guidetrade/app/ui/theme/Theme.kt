package com.guidetrade.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.animateColor
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.TextUnitType
import androidx.compose.ui.unit.TextUnitType.LineHeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.min
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

private val GradientStart = Color(0xFF6366F1)
private val GradientEnd = Color(0xFF8B5CF6)

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

val Typography = Typography(
    displayLarge = androidx.compose.material3.Typography().displayLarge.copy(
        fontFamily = androidx.compose.ui.text.font.FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        lineHeight = TextUnit(50.0, TextUnitType.Sp),
    ),
    titleLarge = androidx.compose.material3.Typography().titleLarge.copy(
        fontFamily = androidx.compose.ui.text.font.FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        lineHeight = TextUnit(28.0, TextUnitType.Sp),
    ),
    bodyLarge = androidx.compose.material3.Typography().bodyLarge.copy(
        fontFamily = androidx.compose.ui.text.font.FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        lineHeight = TextUnit(22.0, TextUnitType.Sp),
    ),
    bodyMedium = androidx.compose.material3.Typography().bodyMedium.copy(
        fontFamily = androidx.compose.ui.text.font.FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        lineHeight = TextUnit(20.0, TextUnitType.Sp),
    ),
)

@Composable
fun GuideTradeTheme(
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? ComponentActivity
    val isDark = activity?.let {
        it.startActivity?.let { true }
    } ?: false

    val colors = if (isDark) GuideTradeDarkColorScheme else GuideTradeColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}

@Composable
fun Orb(
    state: OrbState = OrbState.Idle,
    modifier: Modifier = Modifier,
    size: Float = 120f,
    onOrbClick: () -> Unit = {}
) {
    val pulsePhase = remember { mutableStateOf(0f) }

    LaunchedEffect(Unit) {
        pulsePhase.value = 0f
        while (true) {
            pulsePhase.value = (pulsePhase.value + 0.02f) % 1f
            kotlinx.coroutines.delay(16)
        }
    }

    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(CircleShape)
            .background(
                brush = when (state) {
                    OrbState.Idle, OrbState.Listening ->
                        Brush.radialGradient(
                            colors = listOf(
                                GradientStart.copy(alpha = 0.8f),
                                GradientEnd.copy(alpha = 0.5f)
                            ),
                            center = Offset(size / 2, size / 2),
                            radius = size / 2
                        )
                    OrbState.Thinking ->
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFFFCD34D).copy(alpha = 0.8f),
                                Color(0xFFF59E0B).copy(alpha = 0.5f)
                        ),
                            center = Offset(size / 2, size / 2),
                            radius = size / 2
                        )
                    OrbState.Speaking ->
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF34D399).copy(alpha = 0.8f),
                                Color(0xFF05B386).copy(alpha = 0.5f)
                            ),
                            center = Offset(size / 2, size / 2),
                            radius = size / 2
                        )
                    OrbState.Error ->
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFFF87171).copy(alpha = 0.8f),
                                Color(0xFFEF4444).copy(alpha = 0.5f)
                            ),
                            center = Offset(size / 2, size / 2),
                            radius = size / 2
                        )
                },
            )
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .aspectRatio(1f)
        ) {
            val centerX = size / 2
            val centerY = size / 2
            val waveRadius = size * 0.4f + (size * 0.15f * pulsePhase.value)
            val strokeWidth = 4f

            drawCircle(
                color = Color.White.copy(alpha = 0.15f),
                radius = waveRadius,
                style = Stroke(
                    width = strokeWidth,
                    cap = StrokeCap.Round
                )
            )

            drawCircle(
                color = Color.White.copy(alpha = 0.1f * (1 - pulsePhase.value)),
                radius = waveRadius + 10,
                style = Stroke(
                    width = 2f,
                    cap = StrokeCap.Round
                )
            )
        }
    }
}

enum class OrbState {
    Idle, Listening, Thinking, Speaking, Error
}
