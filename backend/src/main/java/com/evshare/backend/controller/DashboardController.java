package com.evshare.backend.controller;

import com.evshare.backend.dto.DashboardDTO;
import com.evshare.backend.entity.Booking;
import com.evshare.backend.entity.Vote;
import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Transaction;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import com.evshare.backend.entity.FundTransaction;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private final VoteRepository voteRepository;
    private final SuggestionRepository suggestionRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final CheckinLogRepository checkinLogRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User loggedUser = null;
        if (userId != null) {
            loggedUser = userRepository.findById(userId).orElse(null);
        }

        if (loggedUser == null) {
            // Do not fallback to a hardcoded user, just return empty or error
            return ResponseEntity.badRequest().build();
        }

        boolean isCoOwner = loggedUser.getVehicle() != null && loggedUser.getOwnershipPercentage() != null && loggedUser.getOwnershipPercentage() > 0;

        var vehicle = isCoOwner 
                ? loggedUser.getVehicle()
                : null; // Brand new user has no vehicle yet

        var coOwners = isCoOwner
                ? userRepository.findAll().stream()
                        .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(vehicle.getId()))
                        .collect(Collectors.toList())
                : List.of(loggedUser);

        var bookings = isCoOwner
                ? bookingRepository.findAll().stream()
                        .filter(b -> b.getVehicle() != null && b.getVehicle().getId().equals(vehicle.getId()))
                        .collect(Collectors.toList())
                : bookingRepository.findAll().stream()
                        .filter(b -> b.getUser() != null && b.getUser().getId().equals(userId))
                        .collect(Collectors.toList());

        var transactions = isCoOwner
                ? transactionRepository.findByVehicle_Id(vehicle.getId())
                : transactionRepository.findByUser_Id(userId);

        var activeVotes = isCoOwner
                ? voteRepository.findByVehicle_Id(vehicle.getId())
                : Collections.<Vote>emptyList(); // New user has no votes yet

        var suggestions = isCoOwner
                ? suggestionRepository.findByVehicle_Id(vehicle.getId())
                : Collections.<com.evshare.backend.entity.Suggestion>emptyList();

        // Calculate KPI
        double totalCost = 0.0;
        if (isCoOwner && transactions != null) {
            for (Transaction t : transactions) {
                if ("OUT".equals(t.getType()) || t.getAmount() > 0) {
                    totalCost += t.getAmount();
                }
            }
        }
        
        double drivenKm = isCoOwner ? (vehicle.getOdometer() != null ? vehicle.getOdometer() : 0.0) : 0.0;
        int bookingCount = bookings.size();
        double jointFund = isCoOwner ? (vehicle.getJointFundBalance() != null ? vehicle.getJointFundBalance() : 0.0) : 0.0;

        var kpi = DashboardDTO.KpiDTO.builder()
                .totalCostThisMonth(totalCost)
                .costChangePercentage(0.0)
                .drivenKmThisMonth(drivenKm)
                .kmChangePercentage(0.0)
                .bookingCountThisMonth(bookingCount)
                .jointFundBalance(jointFund)
                .jointFundStatus(isCoOwner && jointFund > 0 ? "Ổn định" : "Chưa có quỹ")
                .build();

        var dashboard = DashboardDTO.builder()
                .vehicle(vehicle)
                .kpi(kpi)
                .bookings(bookings)
                .transactions(transactions)
                .coOwners(coOwners)
                .activeVotes(activeVotes)
                .suggestions(suggestions)
                .build();

        return ResponseEntity.ok(dashboard);
    }

    @PostMapping("/bookings")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null || user.getVehicle() == null) {
            return ResponseEntity.badRequest().body("Bạn chưa có xe để đặt lịch.");
        }

        // 1. Lock the vehicle to prevent race conditions from other users booking the same vehicle
        Vehicle vehicle = vehicleRepository.findByIdWithLock(user.getVehicle().getId()).orElse(null);
        if (vehicle == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy xe.");
        }

        if (vehicle.getStatus() == Vehicle.VehicleStatus.IN_USE) {
            return ResponseEntity.badRequest().body("Xe đang được sử dụng trên đường, không thể đặt lịch lúc này. Vui lòng chờ xe được trả về bãi!");
        }

        // 2. Check for overlapping bookings
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(vehicle.getId(), bookingRequest.getStartTime(), bookingRequest.getEndTime());
        if (!overlaps.isEmpty()) {
            return ResponseEntity.badRequest().body("Thời gian này đã có người đặt lịch.");
        }

        // 3. Check Quota (e.g. 1% ownership = 1.68 hours per week). Simplify by just checking against 33 hours for 20%
        long hoursToBook = ChronoUnit.HOURS.between(bookingRequest.getStartTime(), bookingRequest.getEndTime());
        double maxHoursAllowed = (user.getOwnershipPercentage() / 100.0) * 168.0; // 168 hours in a week
        if (hoursToBook > maxHoursAllowed) {
            return ResponseEntity.badRequest().body("Vượt quá số giờ cho phép dựa trên tỷ lệ sở hữu (" + maxHoursAllowed + " giờ/tuần).");
        }

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .purpose(bookingRequest.getPurpose())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/votes/{id}/cast")
    @Transactional
    public ResponseEntity<?> castVote(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getOwnershipPercentage() == null) {
            return ResponseEntity.badRequest().body("Bạn không có quyền biểu quyết.");
        }

        Vote vote = voteRepository.findById(id).orElse(null);
        if (vote != null && "OPEN".equals(vote.getStatus())) {
            vote.setAgreedPercentage(vote.getAgreedPercentage() + user.getOwnershipPercentage());
            
            if (vote.getAgreedPercentage() >= 50.0) {
                vote.setDescription(vote.getTitle() + " – Đã thông qua (" + vote.getAgreedPercentage() + "% đồng ý)");
                vote.setStatus("CLOSED");
            } else {
                vote.setDescription(vote.getTitle() + " – " + vote.getAgreedPercentage() + "% đồng ý");
            }
            voteRepository.save(vote);
            return ResponseEntity.ok(vote);
        }
        return ResponseEntity.badRequest().body("Cuộc biểu quyết đã đóng hoặc không tồn tại.");
    }

    @GetMapping("/vehicles/{id}/transactions")
    public ResponseEntity<List<FundTransaction>> getFundTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(fundTransactionRepository.findByVehicle_IdOrderByTransactionDateDesc(id));
    }

    @PostMapping("/transactions/{id}/pay")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> payTransaction(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Transaction tx = transactionRepository.findById(id).orElse(null);
        if (tx == null) return ResponseEntity.badRequest().body("Giao dịch không tồn tại.");
        
        if (tx.getUser() != null && !tx.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Không có quyền truy cập.");
        }

        if ("PAID".equals(tx.getStatus())) {
            return ResponseEntity.badRequest().body("Giao dịch đã được thanh toán.");
        }

        tx.setStatus("PAID");
        transactionRepository.save(tx);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/checkin-logs")
    public ResponseEntity<?> getUserCheckinLogs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return ResponseEntity.ok(checkinLogRepository.findByUser_IdOrderByTimestampDesc(userId));
    }

    @Data
    public static class BookingRequest {
        private Long userId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String purpose;
    }
}
