package com.example.kritimobileapp.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.kritimobileapp.data.JobRepository

class RefreshDataWorker(appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val repository = JobRepository()
        return try {
            repository.getJobs()
            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }
}