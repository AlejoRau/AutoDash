package com.dashboard.automations.repository;

import com.dashboard.automations.model.Automation;
import com.dashboard.automations.model.AutomationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AutomationRepository extends JpaRepository<Automation, Long> {
    Page<Automation> findAllByUserId(Long userId, Pageable pageable);
    Page<Automation> findAllByUserIdAndStatus(Long userId, AutomationStatus status, Pageable pageable);
    Page<Automation> findAllByUserIdAndNameContainingIgnoreCase(Long userId, String name, Pageable pageable);
    Page<Automation> findAllByUserIdAndStatusAndNameContainingIgnoreCase(Long userId, AutomationStatus status, String name, Pageable pageable);
    Optional<Automation> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("DELETE FROM Automation a WHERE a.id = :id AND a.user.id = :userId")
    int deleteByIdAndUserId(Long id, Long userId);
}
