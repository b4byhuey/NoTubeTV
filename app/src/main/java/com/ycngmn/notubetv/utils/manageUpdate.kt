package com.ycngmn.notubetv.utils

import android.content.Context
import com.multiplatform.webview.web.WebViewNavigator
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import org.json.JSONObject

data class ReleaseData (
    val tagName: String,
    val changelog: String,
    val downloadUrl: String
)

suspend fun fetchUpdate() : ReleaseData {
    val fetchUrl = "https://api.github.com/repos/ycngmn/notubetv/releases/latest"
    val client = HttpClient(OkHttp)
    val req = client.get(fetchUrl)
    val res = JSONObject(req.body() as String)

    val commitSHA = Regex("\\b[a-fA-F0-9]{40}\\b")

    return ReleaseData(
        tagName = res.getString("tag_name"),
        changelog = res.getString("body")
            .substringAfter("</ins>").replace(commitSHA, "").replace(Regex("\\s{2,}"), " "),
        downloadUrl = res.getJSONArray("assets").getJSONObject(0).getString("browser_download_url")
    )
}


suspend fun getUpdate(context: Context, navigator: WebViewNavigator, callback: (ReleaseData?) -> Unit) {
    try {
        val remoteRelease = fetchUpdate()
        val remoteVersion = remoteRelease.tagName.removePrefix("v")

        if (remoteVersion > getLocalVersion(context)) {
            getSkipVersion(navigator) {
                val skipVersion = it?.removeSurrounding("\"")?.removePrefix("v")
                if (skipVersion != remoteVersion)
                    callback(remoteRelease)
                else callback(null)
            }
        }
        else callback(null)

    } catch (_: Exception) { callback(null) }
}

private fun getLocalVersion(context: Context): String {
    val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
    return pInfo.versionName.toString()
}

fun getSkipVersion(navigator: WebViewNavigator, callback: (String?) -> Unit) {
    navigator.evaluateJavaScript("configRead('skipVersionName')") {
        callback(it)
    }
}