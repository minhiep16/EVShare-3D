package com.evshare.backend.controller;

import com.evshare.backend.entity.ServiceRecord;
import com.evshare.backend.entity.ServiceTemplate;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.VehicleRepository;
import com.evshare.backend.repository.ServiceRecordRepository;
import com.evshare.backend.repository.ServiceTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import com.evshare.backend.repository.FundTransactionRepository;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.entity.FundTransaction;
import com.evshare.backend.entity.User;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
public class AdminServicesController {

    private final ServiceRecordRepository serviceRecordRepository;
    private final ServiceTemplateRepository serviceTemplateRepository;
    private final VehicleRepository vehicleRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<ServiceRecord> createServiceRecord(@RequestBody ServiceRecordRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        ServiceRecord record = ServiceRecord.builder()
                .vehicle(vehicle)
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .cost(request.getCost())
                .scheduledDate(request.getScheduledDate())
                .status("PENDING")
                .build();

        return ResponseEntity.ok(serviceRecordRepository.save(record));
    }

    @Data
    public static class ServiceRecordRequest {
        private Long vehicleId;
        private String serviceType;
        private String description;
        private Double cost;
        private java.time.LocalDateTime scheduledDate;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceRecord>> getPendingServices() {
        // Also fetch IN_PROGRESS so Admin can see them
        List<ServiceRecord> pending = serviceRecordRepository.findByStatus("PENDING");
        List<ServiceRecord> inProgress = serviceRecordRepository.findByStatus("IN_PROGRESS");
        pending.addAll(inProgress);
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<ServiceRecord>> getCompletedServices() {
        return ResponseEntity.ok(serviceRecordRepository.findByStatus("COMPLETED"));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<ServiceTemplate>> getServiceTemplates() {
        return ResponseEntity.ok(serviceTemplateRepository.findByIsActiveTrue());
    }

    @PostMapping("/templates")
    public ResponseEntity<ServiceTemplate> createTemplate(@RequestBody ServiceTemplate request) {
        return ResponseEntity.ok(serviceTemplateRepository.save(request));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startService(@PathVariable Long id) {
        ServiceRecord record = serviceRecordRepository.findById(id).orElse(null);
        if (record == null) return ResponseEntity.badRequest().body("Service not found");
        
        record.setStatus("IN_PROGRESS");
        serviceRecordRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "Đã bắt đầu thực hiện dịch vụ!"));
    }

    @PutMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<?> completeService(@PathVariable Long id, @RequestBody Map<String, Double> payload, HttpServletRequest request) {
        ServiceRecord record = serviceRecordRepository.findById(id).orElse(null);
        if (record == null) return ResponseEntity.badRequest().body("Service not found");
        
        Double actualCost = payload.get("actualCost");
        if (actualCost == null || actualCost < 0) {
            return ResponseEntity.badRequest().body("Invalid cost");
        }

        // Update ServiceRecord
        record.setStatus("COMPLETED");
        record.setCost(actualCost);
        // Note: The original Entity might not have completedDate, we just use scheduledDate or add it.
        serviceRecordRepository.save(record);

        // Deduct from joint fund
        Vehicle vehicle = record.getVehicle();
        if (vehicle != null) {
            vehicle.setJointFundBalance(vehicle.getJointFundBalance() - actualCost);
            vehicleRepository.save(vehicle);

            Long userId = (Long) request.getAttribute("userId");
            User admin = userId != null ? userRepository.findById(userId).orElse(null) : null;

            // Record transaction
            FundTransaction tx = FundTransaction.builder()
                    .vehicle(vehicle)
                    .user(admin)
                    .type("OUT")
                    .title("Chi trả: " + record.getServiceType())
                    .description(record.getDescription())
                    .amount(-actualCost)
                    .transactionDate(java.time.LocalDateTime.now())
                    .build();
            fundTransactionRepository.save(tx);
        }

        return ResponseEntity.ok(Map.of("message", "Đã hoàn thành dịch vụ và tự động trừ quỹ chung!"));
    }
}
