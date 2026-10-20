package com.finai.expense_manager.service;


import com.finai.expense_manager.dto.BudgetProgressResponse;
import com.finai.expense_manager.dto.BudgetRequest;
import com.finai.expense_manager.dto.BudgetResponse;
import com.finai.expense_manager.model.Budget;
import com.finai.expense_manager.model.TransactionType;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.BudgetRepository;
import com.finai.expense_manager.repository.TransactionRepository;
import com.finai.expense_manager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository, TransactionRepository transactionRepository){
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public BudgetResponse createBudget(String username, BudgetRequest request){
        User user = getUser(username);

        String category = request.getCategory().trim();
        if(budgetRepository.existsByUserIdAndCategoryAndYearAndMonth(
                user.getId(),
                category,
                request.getYear(),
                request.getMonth()
        )){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A budget already exists for this category and month"
            );
        }

        Budget budget = new Budget();

        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setUser(user);

        return new BudgetResponse(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getMyBudget(String username){
        User user = getUser(username);

        return budgetRepository.findByUserId(user.getId())
                .stream()
                .map(BudgetResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(String username, Long budgetId){
        User user = getUser(username);

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Budget not found"
                ));

        return new BudgetResponse(budget);
    }

    @Transactional
    public BudgetResponse updateBudget(String username, Long budgetId, BudgetRequest request){
        User user = getUser(username);

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Budget not found"
                ));

        String category = request.getCategory().trim();
        boolean duplicateExists = budgetRepository.existsByUserIdAndCategoryAndYearAndMonth(
                user.getId(),
                category,
                request.getYear(),
                request.getMonth()
        );

        boolean sameBudgetPeriod = budget.getCategory().equalsIgnoreCase(category)
                && budget.getYear() == request.getYear()
                && budget.getMonth() == request.getMonth();

        if (duplicateExists && !sameBudgetPeriod){
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A budget already exists for this category and month"
            );
        }

        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());

        return new BudgetResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(String username, Long budgetId){

        User user = getUser(username);

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Budget not found"
                ));

        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetProgressResponse> getBudgetProgress(String username, int year, int month){
        if(month <1 || month > 12){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Month must be between 1 and 12"
            );
        }

        User user = getUser(username);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return budgetRepository.findByUserId(user.getId())
                .stream()
                .filter(budget ->
                        budget.getYear() == year
                        && budget.getMonth() == month
                ).map(budget -> {
                    BigDecimal amountSpent = transactionRepository.sumAmountForBudget(
                            user.getId(),
                            budget.getCategory(),
                            TransactionType.DEBIT,
                            startDate,
                            endDate
                    );
                    BigDecimal amountRemaining = budget.getMonthlyLimit().subtract(amountSpent);

                    BigDecimal percentageUsed = amountSpent.multiply(new BigDecimal(100))
                            .divide(budget.getMonthlyLimit(),
                                    2,
                                    RoundingMode.HALF_UP
                            );

                    return new BudgetProgressResponse(
                            budget.getId(),
                            budget.getCategory(),
                            budget.getMonthlyLimit(),
                            amountSpent,
                            amountRemaining,
                            percentageUsed,
                            year,
                            month
                    );
                }).toList();
    }


    private User getUser(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }


}
