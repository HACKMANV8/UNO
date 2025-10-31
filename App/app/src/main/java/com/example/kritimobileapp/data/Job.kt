package com.example.kritimobileapp.data

data class Job(
    val id: String,
    val title: String,
    val company: String,
    val location: String,
    val description: String,
    val companyLogoUrl: String,
    val jobType: String, // e.g., "Full-time", "Internship"
    val applyUrl: String
)