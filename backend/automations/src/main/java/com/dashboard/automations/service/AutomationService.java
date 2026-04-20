package com.dashboard.automations.service;

import com.dashboard.automations.dto.AutomationRequest;
import com.dashboard.automations.dto.AutomationResponse;
import com.dashboard.automations.dto.PagedResponse;
import com.dashboard.automations.exception.ResourceNotFoundException;
import com.dashboard.automations.model.Automation;
import com.dashboard.automations.model.AutomationStatus;
import com.dashboard.automations.model.User;
import com.dashboard.automations.repository.AutomationRepository;
import com.dashboard.automations.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutomationService {

    private final AutomationRepository repository;
    private final UserRepository userRepository;

    public PagedResponse<AutomationResponse> findAll(int page, int size, AutomationStatus status, String search) {
        Long userId = getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Automation> result;

        boolean hasStatus = status != null;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasStatus && hasSearch) {
            result = repository.findAllByUserIdAndStatusAndNameContainingIgnoreCase(userId, status, search, pageable);
        } else if (hasStatus) {
            result = repository.findAllByUserIdAndStatus(userId, status, pageable);
        } else if (hasSearch) {
            result = repository.findAllByUserIdAndNameContainingIgnoreCase(userId, search, pageable);
        } else {
            result = repository.findAllByUserId(userId, pageable);
        }

        return new PagedResponse<>(result.map(AutomationResponse::new));
    }

    public AutomationResponse findById(Long id) {
        Long userId = getCurrentUser().getId();
        return repository.findByIdAndUserId(id, userId)
                .map(AutomationResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
    }

    @Transactional
    public AutomationResponse create(AutomationRequest request) {
        User user = getCurrentUser();
        Automation automation = new Automation();
        automation.setUser(user);
        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setTriggerType(request.getTriggerType());
        automation.setTriggerConfig(request.getTriggerConfig());
        return new AutomationResponse(repository.save(automation));
    }

    @Transactional
    public AutomationResponse update(Long id, AutomationRequest request) {
        Long userId = getCurrentUser().getId();
        Automation automation = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setTriggerType(request.getTriggerType());
        automation.setTriggerConfig(request.getTriggerConfig());
        return new AutomationResponse(repository.save(automation));
    }

    public AutomationResponse updateStatus(Long id, AutomationStatus status) {
        Long userId = getCurrentUser().getId();
        Automation automation = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
        automation.setStatus(status);
        return new AutomationResponse(repository.save(automation));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = getCurrentUser().getId();
        int deleted = repository.deleteByIdAndUserId(id, userId);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Automation not found with id: " + id);
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
