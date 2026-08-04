package com.evshare.backend.controller;

import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.repository.VehicleRepository;
import com.evshare.backend.entity.CheckinLog;
import com.evshare.backend.repository.CheckinLogRepository;
import com.evshare.backend.entity.Transaction;
import com.evshare.backend.repository.TransactionRepository;
import com.evshare.backend.entity.TripLog;
import com.evshare.backend.repository.TripLogRepository;
import com.evshare.backend.entity.ServiceRecord;
import com.evshare.backend.repository.ServiceRecordRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final CheckinLogRepository checkinLogRepository;
    private final TransactionRepository transactionRepository;
    private final TripLogRepository tripLogRepository;
    private final ServiceRecordRepository serviceRecordRepository;

    @GetMapping("/users/unassigned")
    public ResponseEntity<List<User>> getUnassignedUsers() {
        List<User> unassigned = userRepository.findAll().stream()
                .filter(u -> u.getVehicle() == null && "USER".equals(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(unassigned);
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @GetMapping("/vehicle-groups")
    public ResponseEntity<List<VehicleGroupDto>> getVehicleGroups() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<User> allUsers = userRepository.findAll();
        
        List<VehicleGroupDto> groups = vehicles.stream().map(v -> {
            List<User> members = allUsers.stream()
                    .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(v.getId()))
                    .collect(Collectors.toList());
            return new VehicleGroupDto(v, members);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/vehicles/{vehicleId}/add-member")
    public ResponseEntity<?> addMemberToVehicle(@PathVariable Long vehicleId, @RequestBody AddMemberRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElse(null);
        if (vehicle == null) {
            return ResponseEntity.badRequest().body("Vehicle not found");
        }

        User user = userRepository.findById(request.getUserId())
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Calculate current total ownership
        List<User> currentMembers = userRepository.findAll().stream()
                .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(vehicleId))
                .collect(Collectors.toList());

        double currentTotal = currentMembers.stream()
                .filter(u -> !u.getId().equals(user.getId())) // exclude the user being updated if they are already in the group
                .mapToDouble(u -> u.getOwnershipPercentage() != null ? u.getOwnershipPercentage() : 0.0)
                .sum();

        if (currentTotal + request.getOwnershipPercentage() > 100.0) {
            return ResponseEntity.badRequest().body("Tổng tỷ lệ sở hữu vượt quá 100%. Nhóm xe này chỉ còn trống " + (100.0 - currentTotal) + "%.");
        }

        user.setVehicle(vehicle);
        user.setOwnershipPercentage(request.getOwnershipPercentage());
        userRepository.save(user);

        return ResponseEntity.ok("User added to vehicle successfully");
    }

    @PostMapping("/vehicles")
    public ResponseEntity<?> createVehicle(@RequestBody CreateVehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .model(request.getModel())
                .licensePlate(request.getLicensePlate())
                .imageUrl(request.getImageUrl())
                .batteryPercentage(100)
                .odometer(0.0)
                .status(Vehicle.VehicleStatus.AVAILABLE)
                .jointFundBalance(0.0)
                .build();
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(savedVehicle);
    }

    @PostMapping("/vehicles/{vehicleId}/checkout")
    public ResponseEntity<?> checkoutVehicle(@PathVariable Long vehicleId, @RequestBody CheckinRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        User user = userRepository.findById(request.getUserId()).orElse(null);

        if (vehicle == null || user == null) {
            return ResponseEntity.badRequest().body("Vehicle or User not found");
        }

        CheckinLog log = CheckinLog.builder()
                .vehicle(vehicle)
                .user(user)
                .type("CHECKOUT")
                .batteryPercentage(request.getBatteryPercentage())
                .odometer(request.getOdometer())
                .damages(request.getDamages())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .cost(0.0)
                .build();
        checkinLogRepository.save(log);

        vehicle.setStatus(Vehicle.VehicleStatus.IN_USE);
        vehicle.setBatteryPercentage(request.getBatteryPercentage());
        vehicle.setOdometer(request.getOdometer());
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(log);
    }

    @PostMapping("/vehicles/{vehicleId}/checkin")
    public ResponseEntity<?> checkinVehicle(@PathVariable Long vehicleId, @RequestBody CheckinRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        User user = userRepository.findById(request.getUserId()).orElse(null);

        if (vehicle == null || user == null) {
            return ResponseEntity.badRequest().body("Vehicle or User not found");
        }

        // Calculate cost based on odometer diff
        double distanceCost = 0.0;
        List<CheckinLog> previousLogs = checkinLogRepository.findByVehicle_IdAndTypeOrderByTimestampDesc(vehicleId, "CHECKOUT");
        if (!previousLogs.isEmpty()) {
            CheckinLog lastCheckout = previousLogs.get(0);
            if (lastCheckout.getUser().getId().equals(user.getId())) {
                TripLog trip = TripLog.builder()
                        .startOdo(lastCheckout.getOdometer())
                        .endOdo(request.getOdometer())
                        .startBattery(lastCheckout.getBatteryPercentage())
                        .endBattery(request.getBatteryPercentage())
                        .damage3dJson(request.getDamages())
                        .status(TripLog.TripLogStatus.COMPLETED)
                        .build();
                tripLogRepository.save(trip);

                double diff = request.getOdometer() - lastCheckout.getOdometer();
                if (diff > 0) {
                    distanceCost = diff * 2500; // 2500 VND per km
                }
            }
        }

        // Calculate cost based on damages severity
        double damageCost = 0.0;
        String damagesJson = request.getDamages() != null ? request.getDamages() : "";
        int heavyCount = damagesJson.split("\"severity\":\"HEAVY\"").length - 1;
        int mediumCount = damagesJson.split("\"severity\":\"MEDIUM\"").length - 1;
        int lightCount = damagesJson.split("\"severity\":\"LIGHT\"").length - 1;
        damageCost = heavyCount * 5000000.0 + mediumCount * 2000000.0 + lightCount * 500000.0;

        double totalCost = distanceCost + damageCost;

        CheckinLog log = CheckinLog.builder()
                .vehicle(vehicle)
                .user(user)
                .type("CHECKIN")
                .batteryPercentage(request.getBatteryPercentage())
                .odometer(request.getOdometer())
                .damages(request.getDamages())
                .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
                .cost(totalCost)
                .build();
        checkinLogRepository.save(log);

        if (totalCost >= 0) {
            double diff = 0;
            if (!previousLogs.isEmpty()) {
                CheckinLog lastCheckout = previousLogs.get(0);
                if (lastCheckout.getUser().getId().equals(user.getId())) {
                    diff = Math.max(0, request.getOdometer() - lastCheckout.getOdometer());
                }
            }
            
            String breakdown = String.format("Quãng đường: %.1f km (%,.0f VNĐ). ", diff, distanceCost);
            if (lightCount > 0) breakdown += String.format("Lỗi nhẹ x%d. ", lightCount);
            if (mediumCount > 0) breakdown += String.format("Lỗi vừa x%d. ", mediumCount);
            if (heavyCount > 0) breakdown += String.format("Lỗi nặng x%d. ", heavyCount);

            Transaction tx = Transaction.builder()
                    .user(user)
                    .vehicle(vehicle)
                    .type("TRIP_FEE")
                    .categoryName("Phí sử dụng & Phụ phí")
                    .amount(totalCost)
                    .date(request.getTimestamp() != null ? request.getTimestamp().toLocalDate() : java.time.LocalDate.now())
                    .description(breakdown.trim())
                    .status(totalCost > 0 ? "PENDING" : "PAID")
                    .build();
            transactionRepository.save(tx);
        }

        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        vehicle.setBatteryPercentage(request.getBatteryPercentage());
        vehicle.setOdometer(request.getOdometer());
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(log);
    }

    @GetMapping("/checkin-logs")
    public ResponseEntity<List<CheckinLog>> getAllCheckinLogs() {
        return ResponseEntity.ok(checkinLogRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp")));
    }



    @Data
    public static class CheckinRequest {
        private Long userId;
        private Integer batteryPercentage;
        private Double odometer;
        private String damages;
        private LocalDateTime timestamp;
    }

    @Data
    public static class AddMemberRequest {
        private Long userId;
        private Double ownershipPercentage;
    }

    @Data
    public static class CreateVehicleRequest {
        private String model;
        private String licensePlate;
        private String imageUrl;
    }

    @Data
    public static class VehicleGroupDto {
        private Vehicle vehicle;
        private List<User> members;

        public VehicleGroupDto(Vehicle vehicle, List<User> members) {
            this.vehicle = vehicle;
            this.members = members;
        }
    }
}
