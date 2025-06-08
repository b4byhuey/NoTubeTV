package com.ycngmn.notubetv.utils

import android.content.Context
import android.content.pm.PackageManager
import android.webkit.PermissionRequest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.core.content.ContextCompat
import com.multiplatform.webview.web.AccompanistWebChromeClient
import com.multiplatform.webview.web.PlatformWebViewParams

@Composable
fun permHandler(context: Context): PlatformWebViewParams {

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) {}

    val chrome = remember {
        object : AccompanistWebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE in request.resources && !hasPermission(context))
                    permissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                request.grant(request.resources)
            }
        }
    }
    return PlatformWebViewParams(chromeClient = chrome)
}

fun hasPermission(context: Context) : Boolean  {
    return ContextCompat.checkSelfPermission(
        context, android.Manifest.permission.RECORD_AUDIO
    ) == PackageManager.PERMISSION_GRANTED
}