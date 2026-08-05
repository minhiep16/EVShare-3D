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

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
public class AdminServicesController {

    private final ServiceRecordRepository serviceRecordRepository;
    private final ServiceTemplateRepository serviceTemplateRepository;
    private final VehicleRepository vehicleRepository;

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
        return ResponseEntity.ok(serviceRecordRepository.findByStatus("PENDING"));
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
    public ResponseEntity<ServiceTemplate> createServiceTemplate(@RequestBody ServiceTemplate template) {
        template.setIsActive(true);
        return ResponseEntity.ok(serviceTemplateRepository.save(template));
    }
}
