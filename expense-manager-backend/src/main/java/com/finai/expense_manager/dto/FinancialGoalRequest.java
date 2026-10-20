package com.finai.expense_manager.dto;


import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class FinancialGoalRequest {


    @NotBlank(message = "Goal name is required")
    @Size(max = 100, message = "Goal name cannot exceed 100 characters")
    private String goalName;

    @DecimalMin(
            value = "0.00",
            message = "Current amount cannot be negative"
    )
    private BigDecimal currentAmount;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0")
    private BigDecimal targetAmount;

    @FutureOrPresent(message = "Target date cannot be past")
    private LocalDate targetDate;
}
