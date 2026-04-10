package com.dashboard.automations.dto;

import com.dashboard.automations.model.Automation;
import com.dashboard.automations.model.AutomationStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AutomationResponse {

    private final Long id;
    private final String name;
    private final String description;
    private final AutomationStatus status;
    private final String triggerType;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public AutomationResponse(Automation automation) {
        this.id = automation.getId();
        this.name = automation.getName();
        this.description = automation.getDescription();
        this.status = automation.getStatus();
        this.triggerType = automation.getTriggerType();
        this.createdAt = automation.getCreatedAt();
        this.updatedAt = automation.getUpdatedAt();
    }
}
