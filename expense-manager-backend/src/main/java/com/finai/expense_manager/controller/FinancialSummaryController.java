package com.finai.expense_manager.controller;


import com.finai.expense_manager.dto.CategorySpendingResponse;
import com.finai.expense_manager.dto.FinancialSummaryResponse;
import com.finai.expense_manager.service.FinancialSummaryService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/financial-summary")
public class FinancialSummaryController {

    private final FinancialSummaryService financialSummaryService;

    public FinancialSummaryController(FinancialSummaryService financialSummaryService){
        this.financialSummaryService = financialSummaryService;
    }

    @GetMapping
    public FinancialSummaryResponse getFinancialSummary(@AuthenticationPrincipal Jwt jwt){
        return financialSummaryService.getFinancialSummary(
                jwt.getSubject()
        );
    }

    @GetMapping("/monthly")
    public FinancialSummaryResponse getMonthlyFinancialSummary(
            @AuthenticationPrincipal Jwt jwt, @RequestParam int year, @RequestParam int month
    ){
        return financialSummaryService.getMonthlyFinancialSummary(
                jwt.getSubject(), year, month
        );
    }

    @GetMapping("/category-spending")
    public List<CategorySpendingResponse> getCategorySpending(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam int year,
            @RequestParam int month
    ){
        return financialSummaryService.getCategorySpending(jwt.getSubject(), year, month);
    }
}
