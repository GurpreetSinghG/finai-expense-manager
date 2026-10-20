package com.finai.expense_manager.repository;

import com.finai.expense_manager.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {

    List<FinancialGoal> findByUserId(Long userId);

    Optional<FinancialGoal> findByIdAndUserId(Long id, Long userId);
}
