package com.evshare.backend.controller;

import com.evshare.backend.entity.Dispute;
import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.DisputeRepository;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.repository.VehicleRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class UserDisputeController {

    private final DisputeRepository disputeRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    @PostMapping
    public ResponseEntity<?> createDispute(@RequestBody CreateDisputeRequest request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User user = userRepository.findById(userId).orElse(null);
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId()).orElse(null);

        if (user == null || vehicle == null) {
            return ResponseEntity.badRequest().body("User or Vehicle not found");
        }

        Dispute dispute = Dispute.builder()
                .vehicle(vehicle)
                .createdBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .imageUrl(request.getImageUrl())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        disputeRepository.save(dispute);
        return ResponseEntity.ok(dispute);
    }

    @Data
    public static class CreateDisputeRequest {
        private Long vehicleId;
        private String title;
        private String description;
        private String priority;
        private String imageUrl;
    }
}
