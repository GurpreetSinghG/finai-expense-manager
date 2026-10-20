
package com.finai.expense_manager.service;

import com.finai.expense_manager.dto.InvestmentRequest;
import com.finai.expense_manager.dto.InvestmentResponse;
import com.finai.expense_manager.model.Investment;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.InvestmentRepository;
import com.finai.expense_manager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;

    public InvestmentService(
            InvestmentRepository investmentRepository,
            UserRepository userRepository) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
    }

    // CREATE investment
    @Transactional
    public InvestmentResponse createInvestment(
            String username,
            InvestmentRequest request) {

        User user = getUser(username);

        Investment investment = new Investment();

        investment.setInvestmentName(request.getInvestmentName().trim());
        investment.setInvestmentType(request.getInvestmentType().trim());
        investment.setInvestedAmount(request.getInvestedAmount());
        investment.setCurrentValue(request.getCurrentValue());
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setNotes(request.getNotes());
        investment.setUser(user);

        Investment savedInvestment = investmentRepository.save(investment);

        return new InvestmentResponse(savedInvestment);
    }

    // GET all investments belonging to the user
    @Transactional(readOnly = true)
    public List<InvestmentResponse> getMyInvestments(String username) {

        User user = getUser(username);

        return investmentRepository.findByUserId(user.getId())
                .stream()
                .map(InvestmentResponse::new)
                .toList();
    }

    // GET one investment belonging to the user
    @Transactional(readOnly = true)
    public InvestmentResponse getInvestmentById(
            String username,
            Long investmentId) {

        User user = getUser(username);

        Investment investment = investmentRepository
                .findByIdAndUserId(investmentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Investment not found"
                ));

        return new InvestmentResponse(investment);
    }

    // UPDATE investment
    @Transactional
    public InvestmentResponse updateInvestment(
            String username,
            Long investmentId,
            InvestmentRequest request) {

        User user = getUser(username);

        Investment investment = investmentRepository
                .findByIdAndUserId(investmentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Investment not found"
                ));

        investment.setInvestmentName(request.getInvestmentName().trim());
        investment.setInvestmentType(request.getInvestmentType().trim());
        investment.setInvestedAmount(request.getInvestedAmount());
        investment.setCurrentValue(request.getCurrentValue());
        investment.setPurchaseDate(request.getPurchaseDate());
        investment.setNotes(request.getNotes());

        Investment updatedInvestment = investmentRepository.save(investment);

        return new InvestmentResponse(updatedInvestment);
    }

    // DELETE investment
    @Transactional
    public void deleteInvestment(String username, Long investmentId) {

        User user = getUser(username);

        Investment investment = investmentRepository
                .findByIdAndUserId(investmentId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Investment not found"
                ));

        investmentRepository.delete(investment);
    }

    // Find the authenticated user's database record
    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }
}
