package com.dashboard.automations.dto;

import com.dashboard.automations.model.User;
import com.dashboard.automations.model.UserRole;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final LocalDateTime createdAt;
    private final boolean n8nConfigured;
    private final String n8nUrl;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.n8nConfigured = user.getN8nUrl() != null && user.getN8nApiKey() != null;
        this.n8nUrl = user.getN8nUrl();
    }
}
