package com.example.kritimobileapp.ui

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
import androidx.compose.runtime.Composable
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
import com.example.kritimobileapp.data.Job
import com.example.kritimobileapp.data.JobRepository
import com.example.kritimobileapp.viewmodel.JobViewModel
import com.example.kritimobileapp.viewmodel.JobViewModelFactory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobFeedScreen(
    navController: NavController,
    jobViewModel: JobViewModel = viewModel(factory = JobViewModelFactory(JobRepository()))
) {
    val jobs = jobViewModel.jobs

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
                            popUpTo(0) // Clears the back stack to prevent going back to the dashboard
                        }
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier.padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(jobs) { job ->
                JobCard(job = job)
            }
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
            modifier = Modifier
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = job.companyLogoUrl,
                    contentDescription = "${job.company} Logo",
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape),
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
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
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
