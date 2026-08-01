package com.evshare.backend.controller;

import com.evshare.backend.entity.ServiceRecord;
import com.evshare.backend.repository.ServiceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
public class AdminServicesController {

    private final ServiceRecordRepository serviceRecordRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceRecord>> getPendingServices() {
        return ResponseEntity.ok(serviceRecordRepository.findByStatus("PENDING"));
    }
}
