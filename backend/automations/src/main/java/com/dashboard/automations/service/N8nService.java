package com.dashboard.automations.service;

import com.dashboard.automations.dto.N8nSettingsRequest;
import com.dashboard.automations.model.User;
import com.dashboard.automations.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class N8nService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public void saveSettings(String email, N8nSettingsRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String url = request.getN8nUrl().endsWith("/")
            ? request.getN8nUrl().substring(0, request.getN8nUrl().length() - 1)
            : request.getN8nUrl();
        user.setN8nUrl(url);
        user.setN8nApiKey(request.getN8nApiKey());
    }

    public Object getWorkflows(String email) {
        User user = getUserWithN8n(email);
        return proxyGet(user, "/api/v1/workflows");
    }

    public Object getWorkflow(String email, String workflowId) {
        User user = getUserWithN8n(email);
        return proxyGet(user, "/api/v1/workflows/" + workflowId);
    }

    public Object getExecutions(String email, String workflowId) {
        User user = getUserWithN8n(email);
        return proxyGet(user, "/api/v1/executions?workflowId=" + workflowId + "&limit=25");
    }

    public Object activateWorkflow(String email, String workflowId) {
        User user = getUserWithN8n(email);
        return proxyPost(user, "/api/v1/workflows/" + workflowId + "/activate", null);
    }

    public Object deactivateWorkflow(String email, String workflowId) {
        User user = getUserWithN8n(email);
        return proxyPost(user, "/api/v1/workflows/" + workflowId + "/deactivate", null);
    }

    public Object runWorkflow(String email, String workflowId, Map<String, Object> body) {
        User user = getUserWithN8n(email);
        return proxyPost(user, "/api/v1/workflows/" + workflowId + "/run", body);
    }

    private Object proxyGet(User user, String path) {
        HttpHeaders headers = buildHeaders(user.getN8nApiKey());
        ResponseEntity<Object> response = restTemplate.exchange(
                user.getN8nUrl() + path,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Object.class
        );
        return response.getBody();
    }

    private Object proxyPost(User user, String path, Object body) {
        HttpHeaders headers = buildHeaders(user.getN8nApiKey());
        ResponseEntity<Object> response = restTemplate.exchange(
                user.getN8nUrl() + path,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Object.class
        );
        return response.getBody();
    }

    private HttpHeaders buildHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-N8N-API-KEY", apiKey);
        headers.set("Content-Type", "application/json");
        return headers;
    }

    private User getUserWithN8n(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getN8nUrl() == null || user.getN8nApiKey() == null) {
            throw new RuntimeException("n8n not configured");
        }
        return user;
    }
}
