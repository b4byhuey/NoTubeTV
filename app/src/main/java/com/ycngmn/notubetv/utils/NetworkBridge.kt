package com.ycngmn.notubetv.utils

import android.webkit.JavascriptInterface
import com.multiplatform.webview.web.WebViewNavigator
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray

class NetworkBridge(val navigator: WebViewNavigator) {
    private val client = HttpClient(OkHttp)

    @JavascriptInterface
    fun fetch(url: String, videoId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val body = client.get(url).body<String>()
                val filteredBody =
                    if (body.startsWith("[")) filterSponsorBlock(body, videoId)
                    else body
                val js = "window.onNetworkBridgeResponse('$filteredBody');"
                withContext(Dispatchers.Main) { navigator.evaluateJavaScript(js) }
            } catch (_: Exception) { /*Just don't crash'*/ }
        }
    }

    private fun filterSponsorBlock(body: String, videoId: String): String {
        val json = JSONArray(body)

        for (i in 0 until json.length()) {
            val item = json.getJSONObject(i)
            if (item.getString("videoID") == videoId) {
                return item.toString()
            }
        }
        return ""
    }
}