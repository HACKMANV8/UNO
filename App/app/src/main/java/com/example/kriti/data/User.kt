package com.example.kriti.data

import com.google.firebase.Timestamp

// Updated to include all fields from your logs
data class User(
    val aadhaarNumber: String = "",
    val createdAt: Timestamp? = null,
    val email: String = "",
    val kritiId: String = "",
    val name: String = "",
    val phone: String = "",
    val role: String = "",
    val status: String = "",
    val uid: String = "",
    val updatedAt: Timestamp? = null,
    val jobSearchConfig: Map<String, Any>? = null, // Added missing field
    val automatedJobs: Boolean = false,            // Added missing field
    val lastJobUpdate: Timestamp? = null           // Added missing field
)
