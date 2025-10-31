package com.example.kritimobileapp

import android.app.Application
import androidx.work.*
import com.example.kritimobileapp.worker.RefreshDataWorker
import java.util.concurrent.TimeUnit

class KritiApplication : Application() {
    override fun onCreate() {
        super.onCreate()
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