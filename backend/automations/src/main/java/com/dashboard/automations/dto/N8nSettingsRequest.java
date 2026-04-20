package com.dashboard.automations.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class N8nSettingsRequest {

    @NotBlank
    private String n8nUrl;

    @NotBlank
    private String n8nApiKey;
}
