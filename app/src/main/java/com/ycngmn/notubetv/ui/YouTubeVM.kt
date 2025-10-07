package com.ycngmn.notubetv.ui

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.State
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ycngmn.notubetv.utils.ReleaseData
import com.ycngmn.notubetv.utils.fetchScripts
import com.ycngmn.notubetv.utils.getUpdate
import com.multiplatform.webview.web.WebViewNavigator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.content.Context

class YouTubeVM : ViewModel() {
    private val _scriptData = mutableStateOf<String?>(null)
    private val _updateData = mutableStateOf<ReleaseData?>(null)

    val scriptData: State<String?> = _scriptData
    val updateData: State<ReleaseData?> = _updateData

    fun fetchAll(context: Context, navigator: WebViewNavigator) {
        viewModelScope.launch(Dispatchers.IO) {
            _scriptData.value = fetchScripts()
            getUpdate(context, navigator) { update ->
                if (update != null) _updateData.value = update
            }
        }
    }
}
