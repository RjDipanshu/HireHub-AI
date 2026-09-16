package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.job.SavedJobResponseDTO;
import com.hirehub.hirehub_backend.entity.CandidateProfile;
import com.hirehub.hirehub_backend.entity.Job;
import com.hirehub.hirehub_backend.entity.SavedJob;
import com.hirehub.hirehub_backend.repository.CandidateProfileRepository;
import com.hirehub.hirehub_backend.repository.JobRepository;
import com.hirehub.hirehub_backend.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobService jobService;

    @Transactional
    public SavedJobResponseDTO saveJob(UUID candidateSupabaseUserId, UUID jobId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found for user: " + candidateSupabaseUserId));

        Job job = jobRepository.findByIdAndIsDeletedFalse(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        Optional<SavedJob> existing = savedJobRepository.findByCandidateIdAndJobIdAndIsDeletedFalse(candidate.getId(), jobId);
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        SavedJob savedJob = new SavedJob();
        savedJob.setCandidate(candidate);
        savedJob.setJob(job);
        savedJob.setIsDeleted(false);

        SavedJob saved = savedJobRepository.save(savedJob);
        return convertToDTO(saved);
    }

    @Transactional
    public void unsaveJob(UUID candidateSupabaseUserId, UUID jobId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        savedJobRepository.findByCandidateIdAndJobIdAndIsDeletedFalse(candidate.getId(), jobId)
                .ifPresent(savedJobRepository::delete);
    }

    public List<SavedJobResponseDTO> getSavedJobs(UUID candidateSupabaseUserId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserSupabaseUserIdAndIsDeletedFalse(candidateSupabaseUserId)
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        return savedJobRepository.findByCandidateIdAndIsDeletedFalseOrderByCreatedAtDesc(candidate.getId())
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private SavedJobResponseDTO convertToDTO(SavedJob savedJob) {
        return new SavedJobResponseDTO(
                savedJob.getId(),
                savedJob.getCandidate().getId(),
                jobService.convertToDTO(savedJob.getJob(), savedJob.getCandidate().getId()),
                savedJob.getCreatedAt()
        );
    }
}
