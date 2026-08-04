package com.evshare.backend.repository;

import com.evshare.backend.entity.CheckinLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckinLogRepository extends JpaRepository<CheckinLog, Long> {
    List<CheckinLog> findByVehicle_IdOrderByTimestampDesc(Long vehicleId);
    List<CheckinLog> findByVehicle_IdAndTypeOrderByTimestampDesc(Long vehicleId, String type);
    List<CheckinLog> findByUser_IdOrderByTimestampDesc(Long userId);
}
