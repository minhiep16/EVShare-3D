package com.evshare.backend.repository;

import com.evshare.backend.entity.TripLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface TripLogRepository extends JpaRepository<TripLog, Long> {
    @EntityGraph(attributePaths = {"booking"})
    List<TripLog> findAll();
}
