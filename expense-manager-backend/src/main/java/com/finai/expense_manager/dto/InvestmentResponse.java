package com.finai.expense_manager.dto;


import com.finai.expense_manager.model.Investment;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class InvestmentResponse {


    private final Long id;
    private final String investmentName;
    private final String investmentType;
    private final BigDecimal investedAmount;
    private final BigDecimal currentValue;
    private final LocalDate purchaseDate;
    private final String notes;

    public InvestmentResponse(Investment investment){
        this.id = investment.getId();
        this.investmentName = investment.getInvestmentName();
        this.investmentType = investment.getInvestmentType();
        this.investedAmount = investment.getInvestedAmount();
        this.currentValue = investment.getCurrentValue();
        this.purchaseDate = investment.getPurchaseDate();
        this.notes = investment.getNotes();
    }
}
