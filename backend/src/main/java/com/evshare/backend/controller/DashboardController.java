package com.evshare.backend.controller;

import com.evshare.backend.dto.DashboardDTO;
import com.evshare.backend.entity.Booking;
import com.evshare.backend.entity.Vote;
import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Transaction;
import com.evshare.backend.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
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
                ? transactionRepository.findAll()
                : Collections.<Transaction>emptyList(); // New user has no transactions yet

        var activeVotes = isCoOwner
                ? voteRepository.findAll()
                : Collections.<Vote>emptyList(); // New user has no votes yet

        var suggestions = isCoOwner
                ? suggestionRepository.findAll()
                : Collections.<com.evshare.backend.entity.Suggestion>emptyList();

        // Calculate KPI
        double totalCost = isCoOwner ? 2450000.0 : 0.0;
        double drivenKm = isCoOwner ? 342.0 : 0.0;
        int bookingCount = bookings.size();
        double jointFund = isCoOwner ? 15800000.0 : 0.0;

        var kpi = DashboardDTO.KpiDTO.builder()
                .totalCostThisMonth(totalCost)
                .costChangePercentage(isCoOwner ? 12.0 : 0.0)
                .drivenKmThisMonth(drivenKm)
                .kmChangePercentage(isCoOwner ? 8.0 : 0.0)
                .bookingCountThisMonth(bookingCount)
                .jointFundBalance(jointFund)
                .jointFundStatus(isCoOwner ? "Ổn định" : "Chưa có quỹ")
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
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest bookingRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        Booking booking = Booking.builder()
                .user(user)
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .purpose(bookingRequest.getPurpose())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/votes/{id}/cast")
    public ResponseEntity<Vote> castVote(@PathVariable Long id) {
        Vote vote = voteRepository.findById(id).orElse(null);
        if (vote != null && "OPEN".equals(vote.getStatus())) {
            vote.setAgreedCount(vote.getAgreedCount() + 1);
            if (vote.getAgreedCount() >= vote.getTotalCount()) {
                vote.setDescription("Nâng cấp pin xe – " + vote.getAgreedCount() + "/" + vote.getTotalCount() + " đồng ý (Hoàn thành)");
                vote.setStatus("CLOSED");
            } else {
                vote.setDescription("Nâng cấp pin xe – " + vote.getAgreedCount() + "/" + vote.getTotalCount() + " đồng ý");
            }
            voteRepository.save(vote);
            return ResponseEntity.ok(vote);
        }
        return ResponseEntity.notFound().build();
    }

    @Data
    public static class BookingRequest {
        private Long userId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String purpose;
    }
}
