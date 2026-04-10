package com.dashboard.automations.service;

import com.dashboard.automations.dto.AutomationRequest;
import com.dashboard.automations.dto.AutomationResponse;
import com.dashboard.automations.exception.ResourceNotFoundException;
import com.dashboard.automations.model.Automation;
import com.dashboard.automations.model.AutomationStatus;
import com.dashboard.automations.repository.AutomationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AutomationService {

    private final AutomationRepository repository;

    public List<AutomationResponse> findAll() {
        return repository.findAll().stream()
                .map(AutomationResponse::new)
                .toList();
    }

    public AutomationResponse findById(Long id) {
        return repository.findById(id)
                .map(AutomationResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
    }

    public AutomationResponse create(AutomationRequest request) {
        Automation automation = new Automation();
        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setTriggerType(request.getTriggerType());
        return new AutomationResponse(repository.save(automation));
    }

    public AutomationResponse update(Long id, AutomationRequest request) {
        Automation automation = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setTriggerType(request.getTriggerType());
        return new AutomationResponse(repository.save(automation));
    }

    public AutomationResponse updateStatus(Long id, AutomationStatus status) {
        Automation automation = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Automation not found with id: " + id));
        automation.setStatus(status);
        return new AutomationResponse(repository.save(automation));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Automation not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
