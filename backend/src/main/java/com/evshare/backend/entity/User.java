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
    
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isGroupLeader = false;

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
    private String cccdBackImageUrl;
    private String gplxImageUrl;

    // Architecture additions
    @Builder.Default
    private Double walletBalance = 0.0;
    
    @Column(name = "requested_vehicle_id")
    private Long requestedVehicleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;

    @com.fasterxml.jackson.annotation.JsonProperty("vehicleId")
    public Long getVehicleId() {
        return vehicle != null ? vehicle.getId() : null;
    }

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_APPROVAL;

    @Version
    @Builder.Default
    private Integer version = 0;

    public enum UserStatus {
        PENDING_APPROVAL,
        ACTIVE,
        SUSPENDED
    }
}
