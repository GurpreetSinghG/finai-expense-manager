package com.finai.expense_manager.dto;

import com.finai.expense_manager.model.FinancialGoal;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class FinancialGoalResponse {

    private final Long id;
    private final String goalName;
    private final BigDecimal targetAmount;
    private final BigDecimal currentAmount;
    private final LocalDate targetDate;

    public FinancialGoalResponse(FinancialGoal goal){
        this.id = goal.getId();
        this.goalName = goal.getGoalName();
        this.targetAmount = goal.getTargetAmount();
        this.currentAmount = goal.getCurrentAmount();
        this.targetDate = goal.getTargetDate();
    }
}
