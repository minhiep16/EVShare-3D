package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;
    private String licensePlate;
    private Integer batteryPercentage;
    private Double odometer;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    private String imageUrl;

    // Architecture additions
    private Double jointFundBalance = 0.0;

    @Version
    private Integer version = 0;

    public enum VehicleStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE
    }
}
