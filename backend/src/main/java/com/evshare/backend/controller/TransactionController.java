package com.evshare.backend.controller;

import com.evshare.backend.entity.Transaction;
import com.evshare.backend.repository.TransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;

    private final com.evshare.backend.repository.UserRepository userRepository;

    @GetMapping("/my-history")
    public ResponseEntity<List<Transaction>> getMyTransactions(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Transaction> transactions = transactionRepository.findByUser_IdOrderByDateDesc(userId);
        return ResponseEntity.ok(transactions);
    }

}
