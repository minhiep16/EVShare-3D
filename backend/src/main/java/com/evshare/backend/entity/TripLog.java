package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trips_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    private Double startOdo;
    private Double endOdo;
    private Integer startBattery;
    private Integer endBattery;
    
    @Column(columnDefinition = "JSON")
    private String damage3dJson;
    
    @Enumerated(EnumType.STRING)
    private TripLogStatus status = TripLogStatus.COMPLETED;

    public enum TripLogStatus {
        PENDING,
        COMPLETED,
        DISPUTED
    }
}
