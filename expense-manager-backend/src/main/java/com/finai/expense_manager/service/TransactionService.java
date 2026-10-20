package com.finai.expense_manager.service;

import com.finai.expense_manager.dto.TransactionRequest;
import com.finai.expense_manager.dto.TransactionResponse;
import com.finai.expense_manager.model.Transaction;
import com.finai.expense_manager.model.User;
import com.finai.expense_manager.repository.TransactionRepository;
import com.finai.expense_manager.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository){
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String authenticatedUsername){
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));

        Transaction transaction = new Transaction();

        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setMerchant(request.getMerchant());
        transaction.setReferenceNumber(request.getReferenceNumber());
        transaction.setNotes(request.getNotes());
        transaction.setUser(user);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return new TransactionResponse(
                savedTransaction.getId(),
                savedTransaction.getDescription(),
                savedTransaction.getAmount(),
                savedTransaction.getType(),
                savedTransaction.getCategory(),
                savedTransaction.getTransactionDate(),
                savedTransaction.getMerchant(),
                savedTransaction.getReferenceNumber(),
                savedTransaction.getNotes()
        );
    }

    public List<TransactionResponse> getMyTransactions(String authenticatedUsername){
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow( ()->
                  new ResponseStatusException(
                          HttpStatus.UNAUTHORIZED,
                          "Authenticated user not found"
                  ));

        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());

        return transactions.stream()
                .map(transaction -> new TransactionResponse(
                        transaction.getId(),
                        transaction.getDescription(),
                        transaction.getAmount(),
                        transaction.getType(),
                        transaction.getCategory(),
                        transaction.getTransactionDate(),
                        transaction.getMerchant(),
                        transaction.getReferenceNumber(),
                        transaction.getNotes()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse updateTransactionById(Long transactionId, TransactionRequest transactionRequest, String authenticatedUsername){
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                "Authenticated User not Found"
                        ));

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, user.getId())
                .orElseThrow(()->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Transaction not found"
                        ));

        transaction.setDescription(transactionRequest.getDescription());
        transaction.setAmount(transactionRequest.getAmount());
        transaction.setType(transactionRequest.getType());
        transaction.setCategory(transactionRequest.getCategory());
        transaction.setTransactionDate(transactionRequest.getTransactionDate());
        transaction.setMerchant(transactionRequest.getMerchant());
        transaction.setReferenceNumber(transactionRequest.getReferenceNumber());
        transaction.setNotes(transactionRequest.getNotes());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        return new TransactionResponse(
                updatedTransaction.getId(),
                updatedTransaction.getDescription(),
                updatedTransaction.getAmount(),
                updatedTransaction.getType(),
                updatedTransaction.getCategory(),
                updatedTransaction.getTransactionDate(),
                updatedTransaction.getMerchant(),
                updatedTransaction.getReferenceNumber(),
                updatedTransaction.getNotes()
        );
    }

    @Transactional
    public void deleteTransactionById(Long id, String authenticatedUsername){
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(()->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        ));

        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(()-> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));

        transactionRepository.delete(transaction);
    }

    public Page<TransactionResponse> getTransaction(
            String username, int page, int size
    ){
        User user = userRepository.findByUsername(username)
                .orElseThrow(()-> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(
                page, size, Sort.by(Sort.Direction.DESC, "transactionDate")
        );

        return transactionRepository.findByUserId(user.getId(), pageable)
                .map(transaction -> new TransactionResponse(
                        transaction.getId(),
                        transaction.getDescription(),
                        transaction.getAmount(),
                        transaction.getType(),
                        transaction.getCategory(),
                        transaction.getTransactionDate(),
                        transaction.getMerchant(),
                        transaction.getReferenceNumber(),
                        transaction.getNotes()
                ));
    }

}
