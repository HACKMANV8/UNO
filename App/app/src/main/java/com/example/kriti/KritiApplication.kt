package com.example.kriti

import android.app.Application
import androidx.work.*
import com.example.kriti.worker.RefreshDataWorker
import com.google.firebase.FirebaseApp
import java.util.concurrent.TimeUnit

class KritiApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
        setupRecurringWork()
    }

    private fun setupRecurringWork() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val repeatingRequest = PeriodicWorkRequestBuilder<RefreshDataWorker>(
            12, TimeUnit.HOURS
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "job-refresh",
            ExistingPeriodicWorkPolicy.KEEP,
            repeatingRequest
        )
    }
}