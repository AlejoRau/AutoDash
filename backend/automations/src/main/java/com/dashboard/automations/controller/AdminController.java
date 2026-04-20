package com.dashboard.automations.controller;

import com.dashboard.automations.dto.UserSummaryResponse;
import com.dashboard.automations.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.findAllUsers());
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserSummaryResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminService.findPendingUsers());
    }

    @PatchMapping("/users/{id}/approve")
    public ResponseEntity<UserSummaryResponse> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveUser(id));
    }

    @PatchMapping("/users/{id}/reject")
    public ResponseEntity<UserSummaryResponse> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectUser(id));
    }
}
