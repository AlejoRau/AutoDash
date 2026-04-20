package com.dashboard.automations.service;

import com.dashboard.automations.dto.AuthResponse;
import com.dashboard.automations.dto.LoginRequest;
import com.dashboard.automations.dto.RegisterRequest;
import com.dashboard.automations.dto.UserProfileResponse;
import com.dashboard.automations.exception.DuplicateResourceException;
import com.dashboard.automations.model.User;
import com.dashboard.automations.model.UserRole;
import com.dashboard.automations.model.UserStatus;
import com.dashboard.automations.repository.UserRepository;
import com.dashboard.automations.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${admin.email}")
    private String adminEmail;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Registration failed. Please try again.");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getEmail().equalsIgnoreCase(adminEmail)) {
            user.setRole(UserRole.ADMIN);
            user.setStatus(UserStatus.ACTIVE);
        } else {
            user.setRole(UserRole.USER);
            user.setStatus(UserStatus.PENDING);
        }

        User saved = userRepository.save(user);

        if (saved.getStatus() == UserStatus.PENDING) {
            return new AuthResponse(null, saved.getId(), saved.getName(), saved.getEmail());
        }

        String token = jwtService.generateToken(buildUserDetails(saved));
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        if (user.getStatus() == UserStatus.PENDING) {
            throw new BadCredentialsException("PENDING");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new BadCredentialsException("REJECTED");
        }

        String token = jwtService.generateToken(buildUserDetails(user));
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return new UserProfileResponse(user);
    }

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
