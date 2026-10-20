package com.finai.expense_manager.dto;


import java.math.BigDecimal;

public record FinancialSummaryResponse(
        BigDecimal totalCredits,
        BigDecimal totalDebits,
        BigDecimal netBalance
) {


}
