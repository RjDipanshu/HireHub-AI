package com.hirehub.hirehub_backend.service;

import com.hirehub.hirehub_backend.dto.candidate.SkillDTO;
import com.hirehub.hirehub_backend.entity.Skill;
import com.hirehub.hirehub_backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillDTO> getAllSkills() {
        return skillRepository.findAllByIsDeletedFalseOrderByNameAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SkillDTO> searchSkills(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllSkills();
        }
        return skillRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(keyword.trim()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SkillDTO> getSkillsByCategory(String category) {
        return skillRepository.findByCategoryIgnoreCaseAndIsDeletedFalse(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillDTO createSkill(SkillDTO skillDTO) {
        if (skillRepository.existsByNameIgnoreCaseAndIsDeletedFalse(skillDTO.getName())) {
            Skill existing = skillRepository.findByNameIgnoreCaseAndIsDeletedFalse(skillDTO.getName()).get();
            return convertToDTO(existing);
        }

        Skill skill = new Skill();
        skill.setName(skillDTO.getName().trim());
        skill.setCategory(skillDTO.getCategory());
        skill.setIsDeleted(false);

        Skill saved = skillRepository.save(skill);
        return convertToDTO(saved);
    }

    public Skill getSkillEntityById(UUID id) {
        return skillRepository.findById(id)
                .filter(s -> !s.getIsDeleted())
                .orElseThrow(() -> new RuntimeException("Skill not found with ID: " + id));
    }

    public SkillDTO convertToDTO(Skill skill) {
        return new SkillDTO(skill.getId(), skill.getName(), skill.getCategory());
    }
}
