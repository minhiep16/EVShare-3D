package com.evshare.backend.controller;

import com.evshare.backend.entity.Dispute;
import com.evshare.backend.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.entity.User;
import com.evshare.backend.repository.TransactionRepository;
import com.evshare.backend.entity.Transaction;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/disputes")
@RequiredArgsConstructor
public class AdminDisputesController {

    private final DisputeRepository disputeRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<List<Dispute>> getAdminDisputes() {
        return ResponseEntity.ok(disputeRepository.findAllByOrderByCreatedAtDesc());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/solve")
    public ResponseEntity<?> solveDispute(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> request) {
        Dispute dispute = disputeRepository.findById(id).orElse(null);
        if (dispute != null) {
            dispute.setStatus("RESOLVED");
            dispute.setResolution((String) request.get("resolution"));
            
            if (request.containsKey("penaltyAmount") && request.get("penaltyAmount") != null) {
                try {
                    Double penalty = Double.valueOf(request.get("penaltyAmount").toString());
                    dispute.setPenaltyAmount(penalty);
                    
                    // Deduct from the accused user's wallet if accusedUserId is provided
                    if (request.containsKey("accusedUserId") && request.get("accusedUserId") != null) {
                        Long accusedId = Long.valueOf(request.get("accusedUserId").toString());
                        User accusedUser = userRepository.findById(accusedId).orElse(null);
                        if (accusedUser != null) {
                            accusedUser.setWalletBalance(accusedUser.getWalletBalance() - penalty);
                            userRepository.save(accusedUser);
                            
                            Transaction penaltyTx = Transaction.builder()
                                    .type("OUT")
                                    .categoryName("Phạt vi phạm")
                                    .amount(penalty)
                                    .date(LocalDate.now())
                                    .description("Phạt sự cố xe: " + dispute.getTitle())
                                    .status("PAID")
                                    .user(accusedUser)
                                    .vehicle(dispute.getVehicle())
                                    .build();
                            transactionRepository.save(penaltyTx);
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            
            disputeRepository.save(dispute);
            return ResponseEntity.ok(dispute);
        }
        return ResponseEntity.badRequest().body("Dispute not found");
    }
}
