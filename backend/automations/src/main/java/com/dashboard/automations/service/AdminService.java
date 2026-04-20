package com.dashboard.automations.service;

import com.dashboard.automations.dto.UserSummaryResponse;
import com.dashboard.automations.exception.ResourceNotFoundException;
import com.dashboard.automations.model.UserStatus;
import com.dashboard.automations.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<UserSummaryResponse> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryResponse::new)
                .toList();
    }

    public List<UserSummaryResponse> findPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING).stream()
                .map(UserSummaryResponse::new)
                .toList();
    }

    @Transactional
    public UserSummaryResponse approveUser(Long id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(UserStatus.ACTIVE);
        return new UserSummaryResponse(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse rejectUser(Long id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(UserStatus.REJECTED);
        return new UserSummaryResponse(userRepository.save(user));
    }
}
