package com.dashboard.automations.repository;

import com.dashboard.automations.model.Automation;
import com.dashboard.automations.model.AutomationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutomationRepository extends JpaRepository<Automation, Long> {
    List<Automation> findByStatus(AutomationStatus status);
}
