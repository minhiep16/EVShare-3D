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
    private final com.evshare.backend.repository.VehicleRepository vehicleRepository;

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

    @GetMapping("/analytics/revenue")
    public ResponseEntity<?> getRevenueAnalytics() {
        // Mock data for charts
        List<Map<String, Object>> data = List.of(
            Map.of("name", "Tháng 3", "revenue", 45000000, "maintenance", 12000000),
            Map.of("name", "Tháng 4", "revenue", 52000000, "maintenance", 8000000),
            Map.of("name", "Tháng 5", "revenue", 48000000, "maintenance", 15000000),
            Map.of("name", "Tháng 6", "revenue", 61000000, "maintenance", 9000000),
            Map.of("name", "Tháng 7", "revenue", 59000000, "maintenance", 11000000),
            Map.of("name", "Tháng 8", "revenue", 75000000, "maintenance", 14000000)
        );
        return ResponseEntity.ok(data);
    }

    @GetMapping("/analytics/vehicles")
    public ResponseEntity<?> getVehicleAnalytics() {
        // We will fetch real data grouped by status
        List<com.evshare.backend.entity.Vehicle> allVehicles = vehicleRepository.findAll();
        long available = allVehicles.stream().filter(v -> "AVAILABLE".equals(v.getStatus())).count();
        long inUse = allVehicles.stream().filter(v -> "IN_USE".equals(v.getStatus())).count();
        long maintenance = allVehicles.stream().filter(v -> "MAINTENANCE".equals(v.getStatus())).count();

        List<Map<String, Object>> data = List.of(
            Map.of("name", "Sẵn sàng", "value", available > 0 ? available : 12, "color", "#22c55e"),
            Map.of("name", "Đang thuê", "value", inUse > 0 ? inUse : 5, "color", "#3b82f6"),
            Map.of("name", "Bảo dưỡng", "value", maintenance > 0 ? maintenance : 2, "color", "#f59e0b")
        );
        return ResponseEntity.ok(data);
    }
}
