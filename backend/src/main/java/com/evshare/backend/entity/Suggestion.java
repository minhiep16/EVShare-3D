package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suggestions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String content;
    private String type; // INFO, WARNING, SUCCESS
    private String iconClass; // ph-chart-line-up, ph-warning-circle, etc.
}
