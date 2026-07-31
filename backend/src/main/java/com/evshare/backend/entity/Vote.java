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
    private Integer agreedCount;
    private Integer totalCount;
    private String status; // OPEN, CLOSED
}
