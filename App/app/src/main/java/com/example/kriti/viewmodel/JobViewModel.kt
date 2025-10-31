package com.example.kriti.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.kriti.data.Credential
import com.example.kriti.data.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class JobViewModel : ViewModel() {

    private val _jobs = MutableStateFlow<List<Job>>(emptyList())
    val jobs: StateFlow<List<Job>> = _jobs

    private val _credentials = MutableStateFlow<List<Credential>>(emptyList())
    val credentials: StateFlow<List<Credential>> = _credentials

    init {
        generateMockJobs()
        generateMockCredentials()
    }

    private fun generateMockJobs() {
        _jobs.value = listOf(
            Job(
                id = "1",
                title = "Software Engineering Intern",
                company = "Google",
                location = "Mountain View, CA",
                description = "Work on challenging projects and gain real-world experience.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
                jobType = "Internship",
                applyUrl = "https://www.google.com/about/careers/applications/"
            ),
            Job(
                id = "2",
                title = "Product Manager",
                company = "Microsoft",
                location = "Redmond, WA",
                description = "Define the product vision, strategy, and roadmap.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
                jobType = "Full-time",
                applyUrl = "https://careers.microsoft.com/us/en/"
            ),
            Job(
                id = "3",
                title = "Data Science Intern",
                company = "Netflix",
                location = "Los Gatos, CA",
                description = "Analyze large datasets to drive product decisions.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
                jobType = "Internship",
                applyUrl = "https://jobs.netflix.com/"
            ),
            Job(
                id = "4",
                title = "UX Designer",
                company = "Apple",
                location = "Cupertino, CA",
                description = "Design intuitive and user-centered experiences for millions.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                jobType = "Full-time",
                applyUrl = "https://www.apple.com/careers/us/"
            ),
            Job(
                id = "5",
                title = "Frontend Developer Intern",
                company = "Facebook",
                location = "Menlo Park, CA",
                description = "Build and maintain user interfaces for Facebook's products.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
                jobType = "Internship",
                applyUrl = "https://www.metacareers.com/areas-of-work/internships/"
            ),
            Job(
                id = "6",
                title = "Backend Engineer",
                company = "Amazon",
                location = "Seattle, WA",
                description = "Develop scalable and robust backend services for AWS.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
                jobType = "Full-time",
                applyUrl = "https://www.amazon.jobs/"
            ),
            Job(
                id = "7",
                title = "Marketing Intern",
                company = "Spotify",
                location = "New York, NY",
                description = "Assist in the development and execution of marketing campaigns.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
                jobType = "Internship",
                applyUrl = "https://www.lifeatspotify.com/student-opportunities"
            ),
            Job(
                id = "8",
                title = "DevOps Engineer",
                company = "Twitter (X)",
                location = "San Francisco, CA",
                description = "Manage and improve the infrastructure for a global platform.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
                jobType = "Full-time",
                applyUrl = "https://careers.x.com/"
            )
        )
    }

    private fun generateMockCredentials() {
        _credentials.value = listOf(
            Credential(
                university = "Tech University",
                major = "Computer Science",
                honors = "Summa Cum Laude",
                credentialType = "Degree",
                gpa = "3.9/4.0",
                experience = "2 years"
            ),
            Credential(
                university = "Design Institute",
                major = "UX/UI Design",
                honors = "Dean's List",
                credentialType = "Certificate",
                gpa = "N/A",
                experience = "1 year"
            )
        )
    }
}

class JobViewModelFactory : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(JobViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return JobViewModel() as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}