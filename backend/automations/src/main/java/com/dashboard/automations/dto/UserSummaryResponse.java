package com.dashboard.automations.dto;

import com.dashboard.automations.model.User;
import com.dashboard.automations.model.UserRole;
import com.dashboard.automations.model.UserStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserSummaryResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final UserStatus status;
    private final UserRole role;
    private final LocalDateTime createdAt;

    public UserSummaryResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.status = user.getStatus();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
    }
}
