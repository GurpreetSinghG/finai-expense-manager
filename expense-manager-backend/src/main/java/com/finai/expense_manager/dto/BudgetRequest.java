package com.finai.expense_manager.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BudgetRequest {


    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "category cannot exceed 100 characters")
    private String category;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Monthly limit should be greater than zero")
    private BigDecimal monthlyLimit;

    @Min(value = 2000, message = "Month must be 2000 or later")
    private int year;


    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private int month;
}
