package com.finai.expense_manager.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InvestmentRequest {

    @NotBlank(message = "Investment name required")
    @Size(max = 100, message = "Investment name cannot exceed 100 characters")
    private String investmentName;

    @NotBlank(message = "Investment type is required")
    @Size(max = 50, message = "Investment type cannot exceed 50 characters")
    private String investmentType;

    @NotNull(message = "Investment amount is required")
    @DecimalMin(value = "0.01", message = "Invested amount must be greater than zero")
    private BigDecimal investedAmount;

    @NotNull(message = "Current value is required")
    @DecimalMin(value = "0.00", message = "Current value cannot be negative")
    private BigDecimal currentValue;

    private LocalDate purchaseDate;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}
