package com.dashboard.automations.controller;

import com.dashboard.automations.dto.N8nSettingsRequest;
import com.dashboard.automations.service.N8nService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/n8n")
@RequiredArgsConstructor
public class N8nController {

    private final N8nService n8nService;

    @PutMapping("/settings")
    public ResponseEntity<Void> saveSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody N8nSettingsRequest request) {
        n8nService.saveSettings(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/workflows")
    public ResponseEntity<Object> getWorkflows(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(n8nService.getWorkflows(userDetails.getUsername()));
    }

    @GetMapping("/workflows/{workflowId}")
    public ResponseEntity<Object> getWorkflow(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String workflowId) {
        return ResponseEntity.ok(n8nService.getWorkflow(userDetails.getUsername(), workflowId));
    }

    @GetMapping("/workflows/{workflowId}/executions")
    public ResponseEntity<Object> getExecutions(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String workflowId) {
        return ResponseEntity.ok(n8nService.getExecutions(userDetails.getUsername(), workflowId));
    }

    @PostMapping("/workflows/{workflowId}/activate")
    public ResponseEntity<Object> activate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String workflowId) {
        return ResponseEntity.ok(n8nService.activateWorkflow(userDetails.getUsername(), workflowId));
    }

    @PostMapping("/workflows/{workflowId}/deactivate")
    public ResponseEntity<Object> deactivate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String workflowId) {
        return ResponseEntity.ok(n8nService.deactivateWorkflow(userDetails.getUsername(), workflowId));
    }

    @PostMapping("/workflows/{workflowId}/run")
    public ResponseEntity<Object> run(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String workflowId,
            @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(n8nService.runWorkflow(userDetails.getUsername(), workflowId, body));
    }
}
