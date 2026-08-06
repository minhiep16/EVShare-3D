package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "votes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String type;
    @Builder.Default
    private Double agreedPercentage = 0.0;
    
    @Builder.Default
    private Double totalPercentage = 100.0;
    
    private String status; // OPEN, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Vehicle vehicle;

    @ElementCollection
    @CollectionTable(name = "vote_voter_ids", joinColumns = @JoinColumn(name = "vote_id"))
    @Column(name = "user_id")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.Set<Long> voterIds = new java.util.HashSet<>();

    @Builder.Default
    private Double rejectedPercentage = 0.0;

    @ElementCollection
    @CollectionTable(name = "vote_rejecter_ids", joinColumns = @JoinColumn(name = "vote_id"))
    @Column(name = "user_id")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.Set<Long> rejecterIds = new java.util.HashSet<>();
}
