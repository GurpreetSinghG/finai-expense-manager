package com.finai.expense_manager.service;

import com.finai.expense_manager.dto.CategorySpendingResponse;
import com.finai.expense_manager.dto.FinancialSummaryResponse;
import com.finai.expense_manager.model.TransactionType;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.TransactionRepository;
import com.finai.expense_manager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class FinancialSummaryService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public FinancialSummaryService(TransactionRepository transactionRepository,
                                   UserRepository userRepository){
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public FinancialSummaryResponse getFinancialSummary(String authenticatedUsername){
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.withDayOfMonth(1);
        LocalDate endDate = startDate.plusMonths(1);

        BigDecimal totalCredits = transactionRepository.getTotalByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.CREDIT, startDate, endDate
        );

        BigDecimal totalDebits = transactionRepository.getTotalByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.DEBIT, startDate, endDate
        );

        BigDecimal netBalance = totalCredits.subtract(totalDebits);

        return new FinancialSummaryResponse(
                totalCredits,
                totalDebits,
                netBalance
        );
    }

    public FinancialSummaryResponse getMonthlyFinancialSummary(
            String authenticatedUsername, int year, int month
    ){
        if(month < 1 || month > 12){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Month must be between 1 and 12"
            );
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1);

        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(()->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated User not found"
                        ));
        BigDecimal totalCredits = transactionRepository.getTotalByUserIdAndTypeAndDateRange(
                user.getId(),TransactionType.CREDIT, startDate, endDate
        );

        BigDecimal totalDebits = transactionRepository.getTotalByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.DEBIT, startDate, endDate
        );

        BigDecimal netBalance = totalCredits.subtract(totalDebits);

        return new FinancialSummaryResponse(
                totalCredits, totalDebits, netBalance
        );
    }

    public List<CategorySpendingResponse> getCategorySpending(
            String authenticatedUsername, int year, int month
    ){
        if (month < 1 || month > 12){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Month must be between 1 and 12"
            );
        }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1);

        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticate user not found"
                ));

        return transactionRepository.getCategorySpendingByUserAndDateRange(
                user.getId(),
                TransactionType.DEBIT,
                startDate,
                endDate
        );
    }
}
