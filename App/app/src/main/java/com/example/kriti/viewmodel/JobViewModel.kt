package com.example.kriti.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.kriti.data.Job
import com.example.kriti.data.JobRepository

class JobViewModel(private val repository: JobRepository) : ViewModel() {

    val jobs: List<Job> = repository.getJobs()

}

class JobViewModelFactory(private val repository: JobRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(JobViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return JobViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}