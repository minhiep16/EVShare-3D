package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkin_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @com.fasterxml.jackson.annotation.JsonProperty("vehicleId")
    public Long getVehicleId() {
        return vehicle != null ? vehicle.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("userName")
    public String getUserName() {
        return user != null ? user.getName() : "Hệ thống";
    }

    private String type; // CHECKIN or CHECKOUT
    
    private Integer batteryPercentage;
    private Double odometer;
    
    @Column(columnDefinition = "TEXT")
    private String damages; // JSON or simple string describing damages

    private Double cost; // Calculated cost if CHECKIN

    private LocalDateTime timestamp;
}
