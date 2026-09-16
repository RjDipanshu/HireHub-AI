package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.recruiter.CompanyRequestDTO;
import com.hirehub.hirehub_backend.dto.recruiter.CompanyResponseDTO;
import com.hirehub.hirehub_backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(companyService.getAllCompanies(search));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<CompanyResponseDTO>> getVerifiedCompanies() {
        return ResponseEntity.ok(companyService.getVerifiedCompanies());
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<CompanyResponseDTO>> getCompaniesByIndustry(@PathVariable String industry) {
        return ResponseEntity.ok(companyService.getCompaniesByIndustry(industry));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @PostMapping
    public ResponseEntity<CompanyResponseDTO> createCompany(@Valid @RequestBody CompanyRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.createCompany(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyRequestDTO dto) {
        return ResponseEntity.ok(companyService.updateCompany(id, dto));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<CompanyResponseDTO> verifyCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.verifyCompany(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
