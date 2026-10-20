package com.finai.expense_manager.dto;

import java.math.BigDecimal;

public record CategorySpendingResponse(
        String category,
        BigDecimal totalAmount
) {}
