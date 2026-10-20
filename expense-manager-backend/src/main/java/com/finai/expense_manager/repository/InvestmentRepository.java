package com.finai.expense_manager.repository;

import com.finai.expense_manager.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByUserId(Long userId);

    Optional<Investment> findByIdAndUserId(Long id, Long userId);
}
