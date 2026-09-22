package com.hirehub.hirehub_backend.enums;

/**
 * Status of a job aggregation sync operation.
 */
public enum SyncStatus {
    RUNNING,
    IN_PROGRESS,
    COMPLETED,
    SUCCESS,
    FAILED,
    PARTIAL
}
