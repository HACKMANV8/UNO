package com.example.kriti.data

import android.content.Context
import android.net.Uri
import com.example.kriti.api.N8nApiService
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class N8nRepository(private val context: Context) {

    private val n8nApiService: N8nApiService by lazy {
        Retrofit.Builder()
            .baseUrl("https://YOUR_N8N_WEBHOOK_URL/") // This base URL is a placeholder and is overridden by the full URL in the service
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(N8nApiService::class.java)
    }

    suspend fun uploadResume(resumeUri: Uri): List<Job> {
        val inputStream = context.contentResolver.openInputStream(resumeUri)!!
        val requestBody = inputStream.readBytes().toRequestBody("*/*".toMediaTypeOrNull())
        val part = MultipartBody.Part.createFormData("resume", "resume.pdf", requestBody)

        return n8nApiService.uploadResume(part)
    }
}
