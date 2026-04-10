package com.dashboard.automations.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AutomationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Trigger type is required")
    private String triggerType;
}
