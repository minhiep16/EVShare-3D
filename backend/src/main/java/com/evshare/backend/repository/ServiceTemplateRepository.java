package com.evshare.backend.repository;

import com.evshare.backend.entity.ServiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTemplateRepository extends JpaRepository<ServiceTemplate, Long> {
    List<ServiceTemplate> findByIsActiveTrue();
}
