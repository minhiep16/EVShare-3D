package com.evshare.backend.repository;

import com.evshare.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByVehicle_Id(Long vehicleId);
    List<Transaction> findByUser_Id(Long userId);
    List<Transaction> findByUser_IdOrderByDateDesc(Long userId);
}
