package com.finai.expense_manager.service;


import com.finai.expense_manager.dto.FinancialGoalRequest;
import com.finai.expense_manager.dto.FinancialGoalResponse;
import com.finai.expense_manager.dto.FinancialSummaryResponse;
import com.finai.expense_manager.model.FinancialGoal;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.FinancialGoalRepository;
import com.finai.expense_manager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FinancialGoalService {

    private final FinancialGoalRepository financialGoalRepository;
    private final UserRepository userRepository;

    public FinancialGoalService(FinancialGoalRepository financialGoalRepository,
                                UserRepository userRepository){
        this.financialGoalRepository = financialGoalRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FinancialGoalResponse createGoal(String username, FinancialGoalRequest financialGoalRequest){
        User user = getUser(username);

        FinancialGoal goal = new FinancialGoal();

        goal.setGoalName(financialGoalRequest.getGoalName().trim());
        goal.setTargetAmount(financialGoalRequest.getTargetAmount());
        goal.setCurrentAmount(
                financialGoalRequest.getCurrentAmount() != null
                        ? financialGoalRequest.getCurrentAmount()
                        : BigDecimal.ZERO
        );
        goal.setTargetDate(financialGoalRequest.getTargetDate());
        goal.setUser(user);

        return new FinancialGoalResponse(financialGoalRepository.save(goal));
    }

    @Transactional(readOnly = true)
    public List<FinancialGoalResponse> getMyGoal(String username){
        User user = getUser(username);

        return financialGoalRepository.findByUserId(user.getId())
                .stream().map(FinancialGoalResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public FinancialGoalResponse getGoalById(String username, Long goalId) {
        User user = getUser(username);

        FinancialGoal goal = financialGoalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Financial goal not found"
                ));

        return new FinancialGoalResponse(goal);
    }

    @Transactional
    public FinancialGoalResponse updateGoal(String username, Long goalId, FinancialGoalRequest request){

        User user = getUser(username);

        FinancialGoal goal = financialGoalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Financial goal not found"
                ));

        goal.setGoalName(request.getGoalName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setTargetDate(request.getTargetDate());

        return new FinancialGoalResponse(financialGoalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String username, Long goalId){
        User user = getUser(username);

        FinancialGoal goal = financialGoalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Financial goal not found"
                ));

        financialGoalRepository.delete(goal);
    }

    private User getUser(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }
}
