package com.evshare.backend.repository;

import com.evshare.backend.entity.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    List<ServiceRecord> findByStatus(String status);
    List<ServiceRecord> findByVehicleIdAndStatus(Long vehicleId, String status);
}
