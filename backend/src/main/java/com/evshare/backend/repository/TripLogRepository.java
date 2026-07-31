package com.evshare.backend.repository;

import com.evshare.backend.entity.TripLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripLogRepository extends JpaRepository<TripLog, Long> {
}
