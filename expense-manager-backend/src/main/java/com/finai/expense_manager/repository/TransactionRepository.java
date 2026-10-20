package com.finai.expense_manager.repository;

import com.finai.expense_manager.dto.CategorySpendingResponse;
import com.finai.expense_manager.model.Transaction;
import com.finai.expense_manager.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long user_id);

    Optional<Transaction> findByIdAndUserId(Long id, Long user_id);

    @Query("""
           SELECT COALESCE(SUM(t.amount),0)
           FROM Transaction t
           WHERE t.user.id = :userId
           AND t.type = :type
           AND t.transactionDate >= :startDate
           AND t.transactionDate < :endDate
           """)
    BigDecimal getTotalByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
            );

    @Query("""
           SELECT new com.finai.expense_manager.dto.CategorySpendingResponse(
               t.category,
               SUM(t.amount)
           )
           FROM Transaction t
           WHERE t.user.id = :userId
           AND t.type = :type
           AND t.transactionDate >= :startDate
           AND t.transactionDate < :endDate
           GROUP BY t.category
           ORDER BY SUM(t.amount) DESC
           """)
    List<CategorySpendingResponse> getCategorySpendingByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(t.amount),0)
            FROM Transaction t
            WHERE t.user.id = :userId
                AND t.category = :category
                AND t.type = :type
                AND t.transactionDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumAmountForBudget(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
}
