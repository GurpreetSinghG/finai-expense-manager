package com.finai.expense_manager.dto;


import com.finai.expense_manager.model.Budget;
import lombok.Getter;

import java.math.BigDecimal;

@Getter

public class BudgetResponse {

    private final Long id;
    private final String category;
    private final BigDecimal monthlyLimit;
    private final int year;
    private final int month;

    public BudgetResponse(Budget budget){
        this.id = budget.getId();
        this.category = budget.getCategory();
        this.monthlyLimit = budget.getMonthlyLimit();
        this.year = budget.getYear();
        this.month = budget.getMonth();
    }
}
