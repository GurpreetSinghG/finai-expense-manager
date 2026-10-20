package com.finai.expense_manager.controller;


import com.finai.expense_manager.dto.FinancialGoalRequest;
import com.finai.expense_manager.dto.FinancialGoalResponse;
import com.finai.expense_manager.service.FinancialGoalService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/financial-goal")
public class FinancialGoalController {

    private final FinancialGoalService financialGoalService;

    public FinancialGoalController(FinancialGoalService financialGoalService){
        this.financialGoalService = financialGoalService;
    }

    @PostMapping
    public FinancialGoalResponse createGoal(@Valid @RequestBody FinancialGoalRequest financialGoalRequest,
                                            @AuthenticationPrincipal Jwt jwt){
        return financialGoalService.createGoal(jwt.getSubject(), financialGoalRequest);
    }

    @GetMapping
    public List<FinancialGoalResponse> getMyGoal(@AuthenticationPrincipal Jwt jwt){
        return financialGoalService.getMyGoal(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public FinancialGoalResponse getGoalById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt){
        return financialGoalService.getGoalById(jwt.getSubject(), id);
    }

    @PutMapping("/{id}")
    public FinancialGoalResponse updateGoal(
            @PathVariable Long id, @Valid @RequestBody FinancialGoalRequest financialGoalRequest, @AuthenticationPrincipal Jwt jwt
    ){
        return financialGoalService.updateGoal(
                jwt.getSubject(),
                id,
                financialGoalRequest
        );
    }

    @DeleteMapping("/{id}")
    public void deleteGoal(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt){
        financialGoalService.deleteGoal(jwt.getSubject(), id);
    }
}
