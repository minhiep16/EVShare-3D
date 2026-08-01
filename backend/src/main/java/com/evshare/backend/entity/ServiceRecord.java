package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private String serviceType; // e.g. "Bảo dưỡng 10,000km", "Sửa chữa"
    private String description;
    private Double cost;
    private String status; // "PENDING", "COMPLETED"
    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;
}
