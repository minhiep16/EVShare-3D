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

    @Data
    public static class AddMemberRequest {
        private Long userId;
        private Double ownershipPercentage;
    }
}
