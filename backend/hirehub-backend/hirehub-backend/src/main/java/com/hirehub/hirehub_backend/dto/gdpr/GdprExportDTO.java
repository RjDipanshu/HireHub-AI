package com.hirehub.hirehub_backend.dto.gdpr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GdprExportDTO {

    private Map<String, Object> exportMetadata;
    private Map<String, Object> accountInfo;
    private Map<String, Object> profileDetails;
    private List<Map<String, Object>> applications;
    private List<Map<String, Object>> interviews;
    private List<Map<String, Object>> supportTickets;
    private List<Map<String, Object>> skills;
    private List<Map<String, Object>> resumes;
}
