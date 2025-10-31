package com.example.kritimobileapp.ui

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "auth") {
        composable("auth") {
            AuthScreen(navController)
        }
        composable("upload_certificate") { 
            UploadCertificateScreen(navController)
        }
        composable("job_feed") { 
            JobFeedScreen(navController)
        }
        composable("bookmarks") { 
            BookmarkScreen(navController)
        }
    }
}