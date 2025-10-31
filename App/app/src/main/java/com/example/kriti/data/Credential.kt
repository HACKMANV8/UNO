package com.example.kriti.data

import com.google.firebase.Timestamp

data class Credential(
    val degreeName: String = "",
    val gpa: String = "",
    val graduationYear: String = "",
    val honors: String = "",
    val major: String = "",
    val university: String = "",
    val credentialType: String = "",
    val expiryDate: Timestamp? = null,
    val issuedDate: Timestamp? = null,
    val issuerName: String = "",
    val issuerUid: String = "",
    val studentKritiId: String = "",
    val verified: Boolean = false,
    val blockchainHash: String = "",
    val experience: String = "" // Added experience field
)
