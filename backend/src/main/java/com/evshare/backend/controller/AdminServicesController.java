package com.evshare.backend.controller;

import com.evshare.backend.entity.ServiceRecord;
import com.evshare.backend.entity.ServiceTemplate;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.VehicleRepository;
import com.evshare.backend.repository.ServiceRecordRepository;
import com.evshare.backend.repository.ServiceTemplateRepository;
import com.evshare.backend.repository.VoteRepository;
import com.evshare.backend.entity.Vote;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import com.evshare.backend.repository.FundTransactionRepository;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.repository.TransactionRepository;
import com.evshare.backend.entity.FundTransaction;
import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Transaction;
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
    private final TransactionRepository transactionRepository;
    private final VoteRepository voteRepository;

    @PostMapping("")
    public ResponseEntity<?> createServiceRecord(@RequestBody ServiceRecordRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        int totalMembers = userRepository.countByVehicle_Id(vehicle.getId());

        // Tạo ServiceRecord với trạng thái VOTING để hiển thị xe trong xưởng nhưng chưa được bắt đầu
        ServiceRecord record = ServiceRecord.builder()
                .vehicle(vehicle)
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .cost(request.getCost())
                .scheduledDate(request.getScheduledDate())
                .status("VOTING")
                .build();
        serviceRecordRepository.save(record);

        // Tạo một Vote Đề xuất để Chủ xe biểu quyết
        Vote vote = Vote.builder()
                .vehicle(vehicle)
                .title("Đề xuất: " + request.getServiceType())
                .description("Chi phí dự kiến: " + request.getCost() + " VNĐ. Lý do: " + request.getDescription() + " (Đề xuất từ Admin)")
                .agreedPercentage(0.0)
                .totalPercentage((double) (totalMembers > 0 ? totalMembers : 1))
                .status("OPEN")
                .build();
        voteRepository.save(vote);

        return ResponseEntity.ok(record);
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
        // Fetch PENDING, IN_PROGRESS, and VOTING so Admin can see them all in the 3D Service Bay
        List<ServiceRecord> pending = serviceRecordRepository.findByStatus("PENDING");
        List<ServiceRecord> inProgress = serviceRecordRepository.findByStatus("IN_PROGRESS");
        List<ServiceRecord> voting = serviceRecordRepository.findByStatus("VOTING");
        pending.addAll(inProgress);
        pending.addAll(voting);
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
        request.setIsActive(true);
        return ResponseEntity.ok(serviceTemplateRepository.save(request));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        serviceTemplateRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ mẫu hoàn toàn"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateServiceRecord(@PathVariable Long id, @RequestBody ServiceRecordRequest request) {
        ServiceRecord record = serviceRecordRepository.findById(id).orElse(null);
        if (record == null) return ResponseEntity.badRequest().body("Service not found");
        
        record.setServiceType(request.getServiceType());
        record.setDescription(request.getDescription());
        record.setCost(request.getCost());
        record.setScheduledDate(request.getScheduledDate());
        
        if (request.getVehicleId() != null && !request.getVehicleId().equals(record.getVehicle().getId())) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            record.setVehicle(vehicle);
        }

        return ResponseEntity.ok(serviceRecordRepository.save(record));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteServiceRecord(@PathVariable Long id) {
        ServiceRecord record = serviceRecordRepository.findById(id).orElse(null);
        if (record == null) return ResponseEntity.badRequest().body("Service not found");
        
        serviceRecordRepository.delete(record);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ!"));
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
                    .description(record.getDescription() + " (Đã thanh toán từ Quỹ chung)")
                    .amount(-actualCost)
                    .transactionDate(java.time.LocalDateTime.now())
                    .build();
            fundTransactionRepository.save(tx);

            // Generate cost-sharing transactions for co-owners using inverse ownership percentage
            List<User> coOwners = userRepository.findAll().stream()
                    .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(vehicle.getId()))
                    .collect(java.util.stream.Collectors.toList());

            if (!coOwners.isEmpty()) {
                double sumWeights = 0.0;
                for (User owner : coOwners) {
                    double pct = owner.getOwnershipPercentage() != null ? owner.getOwnershipPercentage() : 0.0;
                    if (pct > 0) {
                        sumWeights += (1.0 / pct);
                    }
                }

                if (sumWeights > 0) {
                    for (User owner : coOwners) {
                        double pct = owner.getOwnershipPercentage() != null ? owner.getOwnershipPercentage() : 0.0;
                        if (pct > 0) {
                            double weight = 1.0 / pct;
                            double shareRatio = weight / sumWeights;
                            double userShare = actualCost * shareRatio;

                            String desc = String.format(
                                "Chia sẻ phí dịch vụ: %s. Tổng chi phí: %,.0f VNĐ. Cổ phần của bạn: %,.1f%%. Tỉ lệ đóng góp nghịch đảo: %,.2f%%.",
                                record.getServiceType(),
                                actualCost,
                                pct,
                                shareRatio * 100
                            );

                            Transaction memberTx = Transaction.builder()
                                    .user(owner)
                                    .vehicle(vehicle)
                                    .type("MAINTENANCE")
                                    .categoryName("Bảo dưỡng & Nâng cấp")
                                    .amount(userShare)
                                    .date(java.time.LocalDate.now())
                                    .description(desc)
                                    .status("PENDING")
                                    .build();
                            transactionRepository.save(memberTx);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", "Đã hoàn thành dịch vụ, trừ quỹ chung và tạo hóa đơn chia sẻ chi phí!"));
    }
}
