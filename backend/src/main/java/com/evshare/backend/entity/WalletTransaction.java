package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    private Long referenceId;
    
    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType {
        DEPOSIT,
        TRIP_FEE,
        FINE,
        REPAIR,
        JOINT_FUND_DIVIDEND
    }
}
