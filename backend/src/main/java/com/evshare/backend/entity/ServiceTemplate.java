package com.evshare.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g. "Rửa xe bọt tuyết", "Bảo dưỡng 10,000km"
    private String description;
    private Double estimatedCost;
    private Boolean isActive;
}
