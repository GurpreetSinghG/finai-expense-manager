package com.finai.expense_manager.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class BudgetProgressResponse {

    private Long budgetId;
    private String category;
    private BigDecimal monthlyLimit;
    private BigDecimal amountSpent;
    private BigDecimal amountRemaining;
    private BigDecimal percentageUsed;
    private int year;
    private int month;


}
