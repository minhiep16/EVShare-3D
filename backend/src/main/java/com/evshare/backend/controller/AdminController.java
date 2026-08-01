package com.evshare.backend.controller;

import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.repository.VehicleRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

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
