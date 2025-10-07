package com.ycngmn.notubetv

import android.os.Build
import android.os.Bundle
import android.view.WindowInsets
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import com.ycngmn.notubetv.ui.screens.YoutubeWV
import com.ycngmn.notubetv.ui.theme.NoTubeTVTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
			enableEdgeToEdge()
		}

		WindowCompat.setDecorFitsSystemWindows(window, false)
	
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
			val windowMetrics = windowManager.currentWindowMetrics

			val insets = windowMetrics.windowInsets
				.getInsetsIgnoringVisibility(
					WindowInsets.Type.navigationBars() or WindowInsets.Type.statusBars()
				)

			val bounds = windowMetrics.bounds
			val width = bounds.width() - insets.left - insets.right
			val height = bounds.height() - insets.top - insets.bottom
			window.setLayout(width, height)
		} else {
			@Suppress("DEPRECATION")
			val display = windowManager.defaultDisplay
			val metrics = android.util.DisplayMetrics()
			@Suppress("DEPRECATION")
			display.getMetrics(metrics)
			window.setLayout(metrics.widthPixels, metrics.heightPixels)
		}

		setContent {
			NoTubeTVTheme {
				Box(modifier = Modifier.fillMaxSize()) {
					YoutubeWV()
				}
			}
		}
	}

}