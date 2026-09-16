package com.hirehub.hirehub_backend.controller;

import com.hirehub.hirehub_backend.dto.candidate.SkillDTO;
import com.hirehub.hirehub_backend.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillDTO>> getSkills(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(skillService.searchSkills(search));
        }
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SkillDTO>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category));
    }

    @PostMapping
    public ResponseEntity<SkillDTO> createSkill(@Valid @RequestBody SkillDTO skillDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.createSkill(skillDTO));
    }
}
