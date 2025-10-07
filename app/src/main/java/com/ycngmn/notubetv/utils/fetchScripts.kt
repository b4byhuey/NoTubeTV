package com.ycngmn.notubetv.utils

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import kotlinx.coroutines.delay

const val SCRIPTS_URL_PRIMARY = "https://raw.githubusercontent.com/b4byhuey/NoTubeTV/main/assets/userscripts_minified.js"
const val SCRIPTS_URL_FALLBACK = "http://82.197.69.253:8081/userscripts_minified.js"

suspend fun fetchScripts(maxRetries: Int = 3, delayMillis: Long = 1000): String {
    HttpClient(OkHttp).use { client ->
        // Coba ke URL utama
        repeat(maxRetries) {
            try {
                val response: HttpResponse = client.get(SCRIPTS_URL_PRIMARY)
                return response.body()
            } catch (_: Exception) {
                delay(delayMillis)
            }
        }

        // Jika gagal, coba ke URL fallback
        repeat(maxRetries) {
            try {
                val response: HttpResponse = client.get(SCRIPTS_URL_FALLBACK)
                return response.body()
            } catch (_: Exception) {
                delay(delayMillis)
            }
        }

        throw Exception("Failed to fetch the script from both primary and fallback URLs after $maxRetries attempts each.")
    }
}
