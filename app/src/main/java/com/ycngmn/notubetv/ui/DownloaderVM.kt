package com.ycngmn.notubetv.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.runtime.MutableState
import androidx.core.content.FileProvider
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsChannel
import io.ktor.http.contentLength
import io.ktor.utils.io.jvm.javaio.toInputStream
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

class UpdateViewModel : ViewModel() {

    private val _downloadProgress = MutableStateFlow(0)
    val downloadProgress = _downloadProgress.asStateFlow()

    fun downloadAndInstall(
        context: Context,
        url: String,
        tagName: String,
        isShowDialog: MutableState<Boolean>
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val apkFile = downloadApk(context, url, tagName)
                withContext(Dispatchers.Main) {
                    installApk(context, apkFile)
                }
            } catch (_: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Download failed $url", Toast.LENGTH_SHORT).show()
                }
            } finally {
                withContext(Dispatchers.Main) {
                    isShowDialog.value = false
                }
            }
        }
    }

    private suspend fun downloadApk(context: Context, url: String, tagName: String): File {
        val client = HttpClient(OkHttp)
        val file = File(context.cacheDir, "NoTubeTV_$tagName.apk")

        val response: HttpResponse = client.get(url)
        val total = response.contentLength() ?: -1L
        var downloaded = 0L

        withContext(Dispatchers.IO) {
            response.bodyAsChannel().toInputStream().use { input ->
                file.outputStream().use { output ->
                    val buffer = ByteArray(4096)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        downloaded += bytesRead
                        if (total > 0) {
                            _downloadProgress.value = ((downloaded * 100) / total).toInt()
                        }
                    }
                }
            }
        }
        return file
    }

    private fun installApk(context: Context, apkFile: File) {
        val apkUri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            apkFile
        )

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }
        context.startActivity(intent)
    }
}
