package com.example.kriti.api

import com.example.kriti.data.Job
import okhttp3.MultipartBody
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface N8nApiService {
    @Multipart
    @POST("https://YOUR_N8N_WEBHOOK_URL/") // <-- IMPORTANT: REPLACE WITH YOUR N8N URL
    suspend fun uploadResume(@Part resume: MultipartBody.Part): List<Job>
}
