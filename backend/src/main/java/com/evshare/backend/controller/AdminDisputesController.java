package com.evshare.backend.controller;

import com.evshare.backend.entity.Dispute;
import com.evshare.backend.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/disputes")
@RequiredArgsConstructor
public class AdminDisputesController {

    private final DisputeRepository disputeRepository;

    @GetMapping
    public ResponseEntity<List<Dispute>> getAdminDisputes() {
        return ResponseEntity.ok(disputeRepository.findAllByOrderByCreatedAtDesc());
    }
}
