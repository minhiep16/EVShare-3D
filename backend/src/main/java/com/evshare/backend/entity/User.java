package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String avatarUrl;
    private String role; // "USER" or "ADMIN"
    private Double ownershipPercentage;
    
    // Credentials
    private String username;
    private String password;
    
    // Contact information
    private String phone;
    private String email;
    
    // Legal documents
    @Column(unique = true)
    private String cccd;
    private String gplx;
    
    // Document scanner OCR resources
    private String cccdImageUrl;
    private String gplxImageUrl;

    // Architecture additions
    private Double walletBalance = 0.0;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    @Version
    private Integer version = 0;

    public enum UserStatus {
        ACTIVE,
        SUSPENDED
    }
}
