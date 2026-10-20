
package com.finai.expense_manager.controller;

import com.finai.expense_manager.dto.InvestmentRequest;
import com.finai.expense_manager.dto.InvestmentResponse;
import com.finai.expense_manager.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/investment")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    // CREATE investment
    @PostMapping
    public ResponseEntity<InvestmentResponse> createInvestment(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InvestmentRequest request) {

        InvestmentResponse response =
                investmentService.createInvestment(
                        jwt.getSubject(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET all investments for the logged-in user
    @GetMapping
    public ResponseEntity<List<InvestmentResponse>> getMyInvestments(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                investmentService.getMyInvestments(jwt.getSubject()));
    }

    // GET one investment
    @GetMapping("/{id}")
    public ResponseEntity<InvestmentResponse> getInvestmentById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                investmentService.getInvestmentById(
                        jwt.getSubject(), id));
    }

    // UPDATE investment
    @PutMapping("/{id}")
    public ResponseEntity<InvestmentResponse> updateInvestment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody InvestmentRequest request) {

        return ResponseEntity.ok(
                investmentService.updateInvestment(
                        jwt.getSubject(), id, request));
    }

    // DELETE investment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        investmentService.deleteInvestment(jwt.getSubject(), id);

        return ResponseEntity.noContent().build();
    }
}
