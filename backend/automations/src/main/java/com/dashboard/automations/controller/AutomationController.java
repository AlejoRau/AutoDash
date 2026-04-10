package com.dashboard.automations.controller;

import com.dashboard.automations.dto.AutomationRequest;
import com.dashboard.automations.dto.AutomationResponse;
import com.dashboard.automations.model.AutomationStatus;
import com.dashboard.automations.service.AutomationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automations")
@RequiredArgsConstructor
public class AutomationController {

    private final AutomationService service;

    @GetMapping
    public ResponseEntity<List<AutomationResponse>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<AutomationResponse> create(@Valid @RequestBody AutomationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AutomationRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AutomationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam AutomationStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
