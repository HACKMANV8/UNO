package com.example.kritimobileapp.api

import com.example.kritimobileapp.data.Post
import retrofit2.http.GET

interface ApiService {
    @GET("posts")
    suspend fun getPosts(): List<Post>
}