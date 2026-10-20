package com.finai.expense_manager.controller;


import com.finai.expense_manager.dto.BudgetProgressResponse;
import com.finai.expense_manager.dto.BudgetRequest;
import com.finai.expense_manager.dto.BudgetResponse;
import com.finai.expense_manager.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService){
        this.budgetService = budgetService;
    }

    @PostMapping
    public BudgetResponse createBudget(@Valid @RequestBody BudgetRequest budgetRequest, @AuthenticationPrincipal Jwt jwt){
        return budgetService.createBudget(jwt.getSubject(), budgetRequest);
    }


    @GetMapping
    public List<BudgetResponse> getMyBudgets(@AuthenticationPrincipal Jwt jwt){
        return budgetService.getMyBudget(jwt.getSubject());
    }


    @GetMapping("/{id}")
    public BudgetResponse getBudgetById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt){
        return budgetService.getBudgetById(jwt.getSubject(), id);
    }

    @PutMapping("/{id}")
    public BudgetResponse updateBudget(@PathVariable Long id, @Valid @RequestBody BudgetRequest request, @AuthenticationPrincipal Jwt jwt){
        return budgetService.updateBudget(
                jwt.getSubject(),
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt){
        budgetService.deleteBudget(jwt.getSubject(), id);
    }

    @GetMapping("/progress")
    public List<BudgetProgressResponse> getMyBudgetProgress(
            @RequestParam int year, @RequestParam int month, @AuthenticationPrincipal Jwt jwt
    ){
        return budgetService.getBudgetProgress(jwt.getSubject(), year, month);
    }

}
