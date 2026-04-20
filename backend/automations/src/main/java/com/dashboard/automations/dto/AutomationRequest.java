package com.dashboard.automations.dto;

import com.dashboard.automations.model.TriggerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AutomationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Trigger type is required")
    private TriggerType triggerType;

    @Size(max = 10000, message = "Trigger config cannot exceed 10000 characters")
    private String triggerConfig;
}
