package com.evshare.backend.repository;

import com.evshare.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @EntityGraph(attributePaths = {"user", "vehicle"})
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status != 'CANCELLED' AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(
        @Param("vehicleId") Long vehicleId, 
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime
    );
}
