package com.evshare.backend.repository;

import com.evshare.backend.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, Long> {
    List<FundTransaction> findByVehicle_IdOrderByTransactionDateDesc(Long vehicleId);
}
