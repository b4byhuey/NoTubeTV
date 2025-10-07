package com.ycngmn.notubetv.ui.screens

import android.app.Activity
import android.os.Build
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.multiplatform.webview.web.LoadingState
import com.multiplatform.webview.web.WebView
import com.multiplatform.webview.web.rememberWebViewNavigator
import com.multiplatform.webview.web.rememberWebViewState
import com.ycngmn.notubetv.R
import com.ycngmn.notubetv.ui.YouTubeVM
import com.ycngmn.notubetv.ui.components.UpdateDialog
import com.ycngmn.notubetv.utils.ExitBridge
import com.ycngmn.notubetv.utils.NetworkBridge
import com.ycngmn.notubetv.utils.permHandler
import com.ycngmn.notubetv.utils.readRaw

@Composable
fun YoutubeWV(youtubeVM: YouTubeVM = viewModel()) {
    val context = LocalContext.current
    val activity = context as Activity

    val state = rememberWebViewState("https://www.youtube.com/tv")
    val navigator = rememberWebViewNavigator()

    val scriptData by youtubeVM.scriptData
    val updateData by youtubeVM.updateData

    val loadingState = state.loadingState
    val exitTrigger = remember { mutableStateOf(false) }

    // Back button behavior
    BackHandler {
        if (loadingState is LoadingState.Finished) {
            navigator.evaluateJavaScript(readRaw(context, R.raw.back_bridge))
        } else {
            exitTrigger.value = true
        }
    }

    // Launch data fetching
    LaunchedEffect(true) {
        youtubeVM.fetchAll(context, navigator)
    }

    // Apply script after load
    if (loadingState is LoadingState.Finished && scriptData != null) {
        navigator.evaluateJavaScript(scriptData!!)
    }

    if (updateData != null) {
        UpdateDialog(updateData!!, navigator)
    }

    if (exitTrigger.value) activity.finish()

    if (loadingState is LoadingState.Loading) {
        SplashLoading(loadingState.progress)
    }

    WebView(
        modifier = Modifier.fillMaxSize(),
        state = state,
        navigator = navigator,
        platformWebViewParams = permHandler(context),
        captureBackPresses = false,
        onCreated = { webView ->

            activity.window.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT
            )

            // Cookie setup
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptCookie(true)
            cookieManager.setAcceptThirdPartyCookies(webView, true)
            Thread { // Handle flushing in background thread
                cookieManager.flush()
            }.start()

            state.webSettings.apply {
                customUserAgentString = "Mozilla/5.0 Cobalt/25 (Sony, PS4, Wired)"
                isJavaScriptEnabled = true
                androidWebSettings.apply {
                    useWideViewPort = true
                    domStorageEnabled = true
                    mediaPlaybackRequiresUserGesture = false
                }
            }

            webView.apply {
                addJavascriptInterface(ExitBridge(exitTrigger), "ExitBridge")
                addJavascriptInterface(NetworkBridge(navigator), "NetworkBridge")
                
                // Fix hardware acceleration for older APIs
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    setLayerType(View.LAYER_TYPE_HARDWARE, null)
                } else {
                    setLayerType(View.LAYER_TYPE_SOFTWARE, null)
                }
                
                setInitialScale(33)
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false
            }
        }
    )
}