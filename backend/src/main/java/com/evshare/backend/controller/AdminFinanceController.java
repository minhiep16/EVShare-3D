package com.evshare.backend.controller;

import com.evshare.backend.entity.FundTransaction;
import com.evshare.backend.repository.FundTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/finance")
@RequiredArgsConstructor
public class AdminFinanceController {

    private final FundTransactionRepository fundTransactionRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getFinanceSummary() {
        List<FundTransaction> allTransactions = fundTransactionRepository.findAll();
        
        Double totalIn = allTransactions.stream()
            .filter(t -> "IN".equals(t.getType()))
            .mapToDouble(FundTransaction::getAmount)
            .sum();
            
        Double totalOut = allTransactions.stream()
            .filter(t -> "OUT".equals(t.getType()))
            .mapToDouble(FundTransaction::getAmount)
            .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFundBalance", totalIn - totalOut);
        summary.put("totalIn", totalIn);
        summary.put("totalOut", totalOut);
        summary.put("recentTransactions", allTransactions.stream().limit(10).toList());

        return ResponseEntity.ok(summary);
    }
}
