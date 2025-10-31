package com.example.kriti.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.kriti.data.Credential
import com.example.kriti.data.Job
import com.example.kriti.viewmodel.JobViewModel
import com.example.kriti.viewmodel.JobViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobFeedScreen(
    navController: NavController,
    jobViewModel: JobViewModel = viewModel(factory = JobViewModelFactory())
) {
    var selectedTab by remember { mutableStateOf(0) }
    val credentials by jobViewModel.credentials.collectAsState()
    val jobs by jobViewModel.jobs.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Your Dashboard") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary,
                ),
                actions = {
                    IconButton(onClick = { navController.navigate("bookmarks") }) {
                        Icon(Icons.Filled.Bookmark, contentDescription = "Bookmarks")
                    }
                    IconButton(onClick = {
                        navController.navigate("auth") {
                            popUpTo(0)
                        }
                    }) {
                        Icon(Icons.Filled.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(modifier = Modifier.padding(paddingValues)) {
            val tabs = listOf("Credentials", "Recommendations")
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            when (selectedTab) {
                0 -> CredentialsTab(credentials)
                1 -> RecommendationsTab(jobs)
            }
        }
    }
}

@Composable
fun CredentialsTab(credentials: List<Credential>) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        items(credentials) { credential ->
            CredentialCard(credential)
        }
    }
}

@Composable
fun RecommendationsTab(jobs: List<Job>) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(jobs) { job ->
            JobCard(job = job)
        }
    }
}

@Composable
fun CredentialCard(credential: Credential) {
    Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(4.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(credential.credentialType, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("University: ${credential.university}")
            Text("Major: ${credential.major}")
            Text("Degree: ${credential.degreeName}")
            Text("GPA: ${credential.gpa}")
            Text("Honors: ${credential.honors}")
            Text("Experience: ${credential.experience}")
        }
    }
}

@Composable
fun JobCard(job: Job) {
    val context = LocalContext.current
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = job.companyLogoUrl,
                    contentDescription = "${job.company} Logo",
                    modifier = Modifier.size(60.dp).clip(CircleShape),
                    contentScale = ContentScale.Fit
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(text = job.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(text = job.company, style = MaterialTheme.typography.bodyLarge)
                    Text(text = job.location, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = job.description, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.secondaryContainer
                ) {
                    Text(
                        text = job.jobType,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                Button(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(job.applyUrl))) }) {
                    Text(text = "Apply Now")
                }
            }
        }
    }
}