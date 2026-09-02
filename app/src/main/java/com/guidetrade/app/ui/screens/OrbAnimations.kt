package com.guidetrade.app.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import com.guidetrade.app.ui.OrbState
import com.guidetrade.app.ui.theme.GradientEnd
import com.guidetrade.app.ui.theme.GradientStart

@Composable
fun IdleOrb() {
    val infiniteTransition = rememberInfiniteTransition(label = "idle")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    val alpha by animateFloatAsState(
        targetValue = 0.8f,
        animationSpec = tween(1000),
        label = "alpha"
    )

    Box(
        modifier = Modifier
            .size(160f * pulseScale)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        GradientStart.copy(alpha = alpha),
                        GradientEnd.copy(alpha = alpha * 0.7f)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(60f)) {
            drawCircle(
                color = Color.White.copy(alpha = 0.5f),
                radius = 20f
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.2f),
                radius = 35f,
                style = Stroke(width = 3f, cap = StrokeCap.Round)
            )
        }
    }
}

@Composable
fun ListeningOrb() {
    val infiniteTransition = rememberInfiniteTransition(label = "listening")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val waveRadius by infiniteTransition.animateFloat(
        initialValue = 40f,
        targetValue = 70f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "waveRadius"
    )

    Box(
        modifier = Modifier
            .size(160f)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        GradientStart.copy(alpha = 0.9f),
                        GradientEnd.copy(alpha = 0.6f)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(160f)) {
            drawCircle(
                color = Color.White.copy(alpha = 0.6f),
                radius = waveRadius,
                style = Stroke(width = 3f, cap = StrokeCap.Round)
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.4f),
                radius = waveRadius + 15f,
                style = Stroke(width = 2f, cap = StrokeCap.Round)
            )
        }
    }
}

@Composable
fun ThinkingOrb() {
    val infiniteTransition = rememberInfiniteTransition(label = "thinking")
    val dot1 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, delay = 0, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "dot1"
    )
    val dot2 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, delay = 200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "dot2"
    )
    val dot3 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, delay = 400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "dot3"
    )

    Box(
        modifier = Modifier
            .size(160f)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFFFCD34D).copy(alpha = 0.8f),
                        Color(0xFFF59E0B).copy(alpha = 0.5f)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.foundation.layout.Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AnimatedDot(alpha = dot1)
            AnimatedDot(alpha = dot2)
            AnimatedDot(alpha = dot3)
        }
    }
}

@Composable
fun SpeakingOrb() {
    val infiniteTransition = rememberInfiniteTransition(label = "speaking")
    val waveHeight by infiniteTransition.animateFloat(
        initialValue = 5f,
        targetValue = 15f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "waveHeight"
    )

    Box(
        modifier = Modifier
            .size(160f)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF34D399).copy(alpha = 0.8f),
                        Color(0xFF05B386).copy(alpha = 0.5f)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(120f)) {
            val centerX = size / 2
            val barWidth = size / 12
            for (i in 0..10) {
                val x = centerX - (size / 2 - barWidth) + (i * barWidth * 1.2f)
                val barHeight = waveHeight * (if (i % 2 == 0) 1f else 0.6f)
                drawRoundRect(
                    color = Color.White.copy(alpha = 0.6f),
                    topLeft = Offset(x, centerX - barHeight),
                    size = androidx.compose.ui.geometry.Size(barWidth, barHeight * 2),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(4f)
                )
            }
        }
    }
}

@Composable
fun ErrorOrb() {
    Box(
        modifier = Modifier
            .size(160f)
            .clip(CircleShape)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFFF87171).copy(alpha = 0.8f),
                        Color(0xFFEF4444).copy(alpha = 0.5f)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(60f)) {
            drawLine(
                color = Color.White,
                start = Offset(size / 4, size / 4),
                end = Offset(size * 3 / 4, size * 3 / 4),
                strokeWidth = 4f,
                cap = StrokeCap.Round
            )
            drawLine(
                color = Color.White,
                start = Offset(size * 3 / 4, size / 4),
                end = Offset(size / 4, size * 3 / 4),
                strokeWidth = 4f,
                cap = StrokeCap.Round
            )
        }
    }
}

@Composable
fun AnimatedDot(alpha: Float) {
    Box(
        modifier = Modifier
            .size(8f)
            .background(
                color = Color.White.copy(alpha = alpha),
                shape = CircleShape
            )
    )
}
