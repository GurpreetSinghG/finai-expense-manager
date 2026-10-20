package com.finai.expense_manager.controller;

import com.finai.expense_manager.dto.TransactionRequest;
import com.finai.expense_manager.dto.TransactionResponse;
import com.finai.expense_manager.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService){
        this.transactionService = transactionService;
    }

    @PostMapping
    public TransactionResponse createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal Jwt jwt){
        return transactionService.createTransaction(
                request,
                jwt.getSubject()
        );
    }

    @PutMapping("/{id}")
    public TransactionResponse updateTransactionById(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal Jwt jwt
    ){
        return  transactionService.updateTransactionById(
                id,
                request,
                jwt.getSubject()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransactionById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt){
        transactionService.deleteTransactionById(id, jwt.getSubject());
    }

    @GetMapping
    public Page<TransactionResponse> getMyTransaction(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        return transactionService.getTransaction(
                jwt.getSubject(),
                page,
                size
        );
    }
}
