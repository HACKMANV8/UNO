package com.example.kritimobileapp.data

class JobRepository {

    fun getJobs(): List<Job> {
        // In a real app, you would fetch this from your API.
        // The API would get the data from web scraping.
        return listOf(
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
                description = "Design intuitive and user-centered experiences.",
                companyLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                jobType = "Full-time",
                applyUrl = "https://www.apple.com/careers/us/"
            )
        )
    }
}