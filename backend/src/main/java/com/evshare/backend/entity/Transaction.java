package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_transaction_date", columnList = "date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // CHARGE, MAINTENANCE, INSURANCE, OTHER, REGISTRATION
    private String categoryName; // "Phí sạc điện", "Bảo dưỡng", "Bảo hiểm", "Đăng kiểm", "Vệ sinh xe"
    private Double amount;
    private java.time.LocalDate date;
    private String description;
    private String status; // PAID, PENDING

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;
}
