package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_time", columnList = "vehicle_id, startTime, endTime")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    public enum BookingStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}
