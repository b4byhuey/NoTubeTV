package com.ycngmn.notubetv.utils

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse

const val SCRIPTS_URL = "https://raw.githubusercontent.com/ycngmn/NoTubeTV/refs/heads/main/assets/userscripts.js"
suspend fun fetchScripts(): String {
    val httpClient = HttpClient(OkHttp)
    while (true) {
        try {
            val response: HttpResponse = httpClient.get(SCRIPTS_URL)
            return response.body()
        } catch (_: Exception) { /* retry */ }
    }
}