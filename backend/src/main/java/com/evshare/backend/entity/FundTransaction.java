package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fund_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String type; // "IN" or "OUT"
    private String title;
    private String description;
    private Double amount;
    private LocalDateTime transactionDate;
}
