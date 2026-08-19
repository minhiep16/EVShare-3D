package com.evshare.backend.controller;

import com.evshare.backend.dto.DashboardDTO;
import com.evshare.backend.entity.Booking;
import com.evshare.backend.entity.Vote;
import com.evshare.backend.entity.User;
import com.evshare.backend.entity.Transaction;
import com.evshare.backend.entity.Vehicle;
import com.evshare.backend.entity.Vote;
import com.evshare.backend.repository.VoteRepository;
import com.evshare.backend.entity.ServiceTemplate;
import com.evshare.backend.repository.ServiceTemplateRepository;
import com.evshare.backend.entity.ServiceRecord;
import com.evshare.backend.repository.ServiceRecordRepository;
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
import java.util.ArrayList;
import java.util.Map;
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
    private final ServiceTemplateRepository serviceTemplateRepository;
    private final ServiceRecordRepository serviceRecordRepository;
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

        List<com.evshare.backend.entity.Suggestion> suggestions = new ArrayList<>();
        if (isCoOwner && vehicle != null) {
            // Suggestion 1: Quỹ chung
            double fund = vehicle.getJointFundBalance() != null ? vehicle.getJointFundBalance() : 0.0;
            if (fund < 2000000) {
                suggestions.add(com.evshare.backend.entity.Suggestion.builder()
                    .id(1L).type("WARNING").iconClass("ph-warning-circle")
                    .content("Quỹ chung đang ở mức thấp (" + fund + " VNĐ). Cân nhắc nạp thêm để dự phòng các chi phí bảo dưỡng sắp tới.")
                    .build());
            } else if (fund > 10000000) {
                suggestions.add(com.evshare.backend.entity.Suggestion.builder()
                    .id(1L).type("SUCCESS").iconClass("ph-check-circle")
                    .content("Quỹ chung đang rất dồi dào, đủ cho 2-3 lần bảo dưỡng tiếp theo.")
                    .build());
            }

            // Suggestion 2: ODO
            double odo = vehicle.getOdometer() != null ? vehicle.getOdometer() : 0.0;
            if (odo > 10000) {
                suggestions.add(com.evshare.backend.entity.Suggestion.builder()
                    .id(2L).type("WARNING").iconClass("ph-wrench")
                    .content("Xe đã chạy hơn 10,000km (" + odo + " km). Hãy kiểm tra lốp và thay dầu phanh nếu cần thiết.")
                    .build());
            } else {
                suggestions.add(com.evshare.backend.entity.Suggestion.builder()
                    .id(2L).type("INFO").iconClass("ph-car-profile")
                    .content("Odo hiện tại là " + odo + "km. Tình trạng xe đang ổn định.")
                    .build());
            }
            
            // Suggestion 3: Booking Usage
            suggestions.add(com.evshare.backend.entity.Suggestion.builder()
                .id(3L).type("INFO").iconClass("ph-chart-line-up")
                .content("Mức sử dụng xe của bạn trong tháng này đang ở mức an toàn so với tỉ lệ sở hữu (" + loggedUser.getOwnershipPercentage() + "%).")
                .build());
        }

        var availableVehicles = isCoOwner ? Collections.<Vehicle>emptyList() : vehicleRepository.findAll();

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
                .availableVehicles(availableVehicles)
                .build();

        return ResponseEntity.ok(dashboard);
    }

    @PostMapping("/vehicles/{id}/request-join")
    public ResponseEntity<?> requestJoinVehicle(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (User.UserStatus.PENDING_APPROVAL.equals(user.getStatus())) {
            return ResponseEntity.badRequest().body("Tài khoản của bạn đang chờ quản trị viên phê duyệt hồ sơ. Bạn chỉ có thể xin vào nhóm xe sau khi tài khoản được kích hoạt.");
        }
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        if (vehicle == null) {
            return ResponseEntity.badRequest().body("Vehicle not found");
        }
        
        user.setRequestedVehicleId(id);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu tham gia nhóm xe!"));
    }

    @PostMapping("/bookings")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null || user.getVehicle() == null) {
            return ResponseEntity.badRequest().body("Bạn chưa có xe để đặt lịch.");
        }
        
        if (bookingRequest.getStartTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Không thể đặt lịch vào thời gian trong quá khứ.");
        }
        if (bookingRequest.getEndTime().isBefore(bookingRequest.getStartTime()) || bookingRequest.getEndTime().isEqual(bookingRequest.getStartTime())) {
            return ResponseEntity.badRequest().body("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
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

        // 3. Check Quota (monthly limit based on ownership)
        LocalDateTime startOfMonth = bookingRequest.getStartTime().withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = bookingRequest.getStartTime().withDayOfMonth(bookingRequest.getStartTime().toLocalDate().lengthOfMonth()).withHour(23).withMinute(59);
        
        List<Booking> monthBookings = bookingRepository.findBookingsByUserInMonth(user.getId(), startOfMonth, endOfMonth);
        
        long totalHoursUsed = 0;
        for (Booking b : monthBookings) {
            totalHoursUsed += ChronoUnit.HOURS.between(b.getStartTime(), b.getEndTime());
        }

        long hoursToBook = ChronoUnit.HOURS.between(bookingRequest.getStartTime(), bookingRequest.getEndTime());
        double maxHoursAllowed = (user.getOwnershipPercentage() / 100.0) * 168.0; // Assume 168h is the standard max limit per month for 100% (or adjust to 168*4)
        // Note: In the E-Contract it says "Tỉ lệ % * 168h" so we use 168h as the baseline.
        
        if ((totalHoursUsed + hoursToBook) > maxHoursAllowed) {
            return ResponseEntity.badRequest().body("Vượt quá số giờ cho phép trong tháng. (Đã dùng: " + totalHoursUsed + "h, Cho phép: " + Math.round(maxHoursAllowed) + "h).");
        }

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .purpose(bookingRequest.getPurpose())
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/vehicles/{id}/votes/propose-service")
    public ResponseEntity<?> proposeService(@PathVariable Long id, @RequestBody ProposeServiceRequest request, HttpServletRequest httpRequest) {
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        if (vehicle == null) return ResponseEntity.badRequest().body("Vehicle not found");

        ServiceTemplate template = serviceTemplateRepository.findById(request.getTemplateId()).orElse(null);
        if (template == null) return ResponseEntity.badRequest().body("Service Template not found");

        int totalMembers = userRepository.countByVehicle_Id(vehicle.getId());

        Vote vote = Vote.builder()
                .vehicle(vehicle)
                .title("Đề xuất: " + template.getName())
                .description("Chi phí dự kiến: " + template.getEstimatedCost() + " VNĐ. Lý do: " + request.getReason())
                .agreedPercentage(0.0)
                .totalPercentage((double) totalMembers)
                .status("OPEN")
                .build();
        return ResponseEntity.ok(voteRepository.save(vote));
    }

    @PostMapping("/vehicles/{vehicleId}/votes/propose-leader")
    public ResponseEntity<?> proposeLeaderVote(@PathVariable Long vehicleId, @RequestBody Map<String, String> payload) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) return ResponseEntity.badRequest().body("Vehicle not found");

        String leaderIdStr = payload.get("leaderId");
        if (leaderIdStr == null) return ResponseEntity.badRequest().body("Missing leaderId");
        Long leaderId = Long.parseLong(leaderIdStr);

        User nominee = userRepository.findById(leaderId).orElse(null);
        if (nominee == null) return ResponseEntity.badRequest().body("Nominee not found");

        int totalMembers = userRepository.countByVehicle_Id(vehicleId);

        Vote vote = Vote.builder()
                .vehicle(vehicle)
                .title("Bầu nhóm trưởng: " + leaderId)
                .description("Đề cử " + (nominee.getName() != null ? nominee.getName() : nominee.getUsername()) + " làm Nhóm trưởng. Nhóm trưởng sẽ có quyền quản lý và chia lại cổ phần cho các thành viên trong xe.")
                .type("ELECTION")
                .voterIds(new java.util.HashSet<>())
                .rejecterIds(new java.util.HashSet<>())
                .agreedPercentage(0.0)
                .rejectedPercentage(0.0)
                .totalPercentage((double) totalMembers)
                .status("OPEN")
                .build();
        return ResponseEntity.ok(voteRepository.save(vote));
    }

    @PostMapping("/votes/{id}/cast")
    @Transactional
    public ResponseEntity<?> castVote(@PathVariable Long id, HttpServletRequest request, @RequestParam(defaultValue = "true") boolean agree) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getOwnershipPercentage() == null) {
            return ResponseEntity.badRequest().body("Bạn không có quyền biểu quyết.");
        }

        Vote vote = voteRepository.findById(id).orElse(null);
        if (vote != null && "OPEN".equals(vote.getStatus())) {
            if (vote.getVoterIds().contains(userId) || vote.getRejecterIds().contains(userId)) {
                return ResponseEntity.badRequest().body("Bạn đã tham gia biểu quyết này rồi.");
            }

            int totalMembers = userRepository.countByVehicle_Id(vote.getVehicle().getId());
            vote.setTotalPercentage((double) totalMembers);

            int requiredVotes;
            if (totalMembers <= 3) {
                requiredVotes = totalMembers;
            } else if (totalMembers == 4) {
                requiredVotes = 3;
            } else if (totalMembers == 5) {
                requiredVotes = 4;
            } else {
                requiredVotes = (int) Math.ceil(totalMembers * 0.8);
            }

            if (agree) {
                vote.getVoterIds().add(userId);
                vote.setAgreedPercentage(vote.getAgreedPercentage() + 1.0);
            } else {
                vote.getRejecterIds().add(userId);
                vote.setRejectedPercentage(vote.getRejectedPercentage() + 1.0);
            }

            int maxAllowedRejects = totalMembers - requiredVotes;

            if (vote.getAgreedPercentage() >= requiredVotes) {
                vote.setDescription(vote.getTitle() + " – Đã thông qua (" + vote.getAgreedPercentage().intValue() + "/" + totalMembers + " đồng ý)");
                vote.setStatus("CLOSED");

                // Auto create or update Service Record if this is a service proposal
                if (vote.getTitle().startsWith("Đề xuất: ")) {
                    String serviceName = vote.getTitle().substring("Đề xuất: ".length());
                    
                    // Check if there is an existing VOTING record created by Admin
                    List<ServiceRecord> existingRecords = serviceRecordRepository.findByVehicleIdAndStatus(vote.getVehicle().getId(), "VOTING");
                    ServiceRecord targetRecord = null;
                    for (ServiceRecord r : existingRecords) {
                        if (r.getServiceType().equals(serviceName)) {
                            targetRecord = r;
                            break;
                        }
                    }

                    if (targetRecord != null) {
                        targetRecord.setStatus("PENDING");
                        serviceRecordRepository.save(targetRecord);
                    } else {
                        ServiceRecord record = ServiceRecord.builder()
                                .vehicle(vote.getVehicle())
                                .serviceType(serviceName)
                                .description(vote.getDescription())
                                .status("PENDING")
                                .cost(0.0) // Admin will finalize cost later
                                .scheduledDate(java.time.LocalDateTime.now().plusDays(3))
                                .build();
                        serviceRecordRepository.save(record);
                    }
                } else if (vote.getTitle().startsWith("Bầu nhóm trưởng: ")) {
                    Long leaderId = Long.parseLong(vote.getTitle().substring("Bầu nhóm trưởng: ".length()));
                    
                    // Reset all members to not leader
                    List<User> groupMembers = userRepository.findAll().stream()
                            .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(vote.getVehicle().getId()))
                            .collect(java.util.stream.Collectors.toList());
                            
                    for (User member : groupMembers) {
                        member.setIsGroupLeader(member.getId().equals(leaderId));
                        userRepository.save(member);
                    }
                }

            } else if (vote.getRejectedPercentage() > maxAllowedRejects) {
                vote.setDescription(vote.getTitle() + " – Bị hủy (" + vote.getRejectedPercentage().intValue() + " người từ chối)");
                vote.setStatus("REJECTED");
            } else {
                vote.setDescription(vote.getTitle() + " – " + vote.getAgreedPercentage().intValue() + "/" + totalMembers + " đồng ý, " + vote.getRejectedPercentage().intValue() + " từ chối");
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
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Transaction tx = transactionRepository.findById(id).orElse(null);
        if (tx == null) return ResponseEntity.badRequest().body("Giao dịch không tồn tại.");
        
        if (tx.getUser() != null && !tx.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body("Không có quyền thanh toán giao dịch này.");
        }

        if ("PAID".equals(tx.getStatus())) {
            return ResponseEntity.badRequest().body("Giao dịch đã được thanh toán trước đó.");
        }

        double amount = tx.getAmount() != null ? tx.getAmount() : 0.0;
        double currentWallet = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;

        if (currentWallet < amount) {
            return ResponseEntity.badRequest().body("Số dư ví cá nhân không đủ để thanh toán. Vui lòng nạp thêm tiền!");
        }

        // Deduct from personal wallet
        user.setWalletBalance(currentWallet - amount);
        userRepository.save(user);

        // Add back to vehicle's joint fund
        Vehicle vehicle = tx.getVehicle();
        if (vehicle != null) {
            double currentFund = vehicle.getJointFundBalance() != null ? vehicle.getJointFundBalance() : 0.0;
            vehicle.setJointFundBalance(currentFund + amount);
            vehicleRepository.save(vehicle);
            
            // Record deposit into the vehicle's joint fund logs
            FundTransaction fundTx = FundTransaction.builder()
                    .vehicle(vehicle)
                    .user(user)
                    .type("IN")
                    .title("Đóng góp: " + tx.getCategoryName())
                    .description("Thành viên thanh toán chia sẻ chi phí: " + tx.getDescription())
                    .amount(amount)
                    .transactionDate(java.time.LocalDateTime.now())
                    .build();
            fundTransactionRepository.save(fundTx);
        }

        tx.setStatus("PAID");
        transactionRepository.save(tx);
        
        return ResponseEntity.ok(Map.of(
            "message", "Thanh toán giao dịch thành công!",
            "transaction", tx,
            "newWalletBalance", user.getWalletBalance()
        ));
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

    @Data
    public static class ProposeServiceRequest {
        private Long templateId;
        private String reason;
    }

    @Data
    public static class DepositRequest {
        private Double amount;
        private String paymentMethod;
    }

    @PostMapping("/vehicles/{id}/deposit")
    @Transactional
    public ResponseEntity<?> depositJointFund(@PathVariable Long id, @RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        if (vehicle == null) return ResponseEntity.badRequest().body("Vehicle not found");

        Double amount = Double.valueOf(payload.get("amount").toString());
        String method = (String) payload.get("paymentMethod");

        // Handle Wallet Deduction
        if ("EVShare Wallet".equals(method)) {
            if (user == null || user.getWalletBalance() == null || user.getWalletBalance() < amount) {
                return ResponseEntity.badRequest().body(Map.of("message", "Số dư ví EVShare không đủ. Vui lòng nạp thêm tiền vào ví."));
            }
            user.setWalletBalance(user.getWalletBalance() - amount);
            userRepository.save(user);
        }

        // Add to vehicle joint fund
        vehicle.setJointFundBalance(vehicle.getJointFundBalance() + amount);
        vehicleRepository.save(vehicle);

        // Record transaction
        FundTransaction tx = FundTransaction.builder()
                .vehicle(vehicle)
                .user(user)
                .type("IN")
                .title("Nạp quỹ chung")
                .description("Nạp qua " + method)
                .amount(amount)
                .transactionDate(java.time.LocalDateTime.now())
                .build();
        fundTransactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
            "message", "Nạp quỹ thành công!",
            "newBalance", vehicle.getJointFundBalance()
        ));
    }

    @PutMapping("/vehicles/{id}/allocate-shares")
    @Transactional
    public ResponseEntity<?> allocateShares(@PathVariable Long id, @RequestBody Map<String, Double> sharesStr, HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        
        if (currentUser == null || !Boolean.TRUE.equals(currentUser.getIsGroupLeader()) || currentUser.getVehicle() == null || !currentUser.getVehicle().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Chỉ Nhóm trưởng mới có quyền chia lại cổ phần.");
        }

        // Convert String keys to Long (JSON keys are often strings)
        Map<Long, Double> shares = new java.util.HashMap<>();
        for (Map.Entry<String, Double> entry : sharesStr.entrySet()) {
            shares.put(Long.parseLong(entry.getKey()), entry.getValue());
        }

        // Validate sum == 100
        double sum = shares.values().stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(sum - 100.0) > 0.01) {
            return ResponseEntity.badRequest().body("Tổng tỷ lệ cổ phần phải bằng đúng 100%.");
        }

        List<User> groupMembers = userRepository.findAll().stream()
                .filter(u -> u.getVehicle() != null && u.getVehicle().getId().equals(id))
                .collect(java.util.stream.Collectors.toList());

        for (User member : groupMembers) {
            Double newShare = shares.get(member.getId());
            if (newShare != null) {
                member.setOwnershipPercentage(newShare);
                userRepository.save(member);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Đã cập nhật cổ phần thành công!"));
    }

    @PostMapping("/vehicles/{vehicleId}/approve-join/{userId}")
    @Transactional
    public ResponseEntity<?> approveJoinRequest(@PathVariable Long vehicleId, @PathVariable Long userId, HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isLeaderOfThisVehicle = Boolean.TRUE.equals(currentUser.getIsGroupLeader()) 
                && currentUser.getVehicle() != null 
                && currentUser.getVehicle().getId().equals(vehicleId);
                
        if (!isAdmin && !isLeaderOfThisVehicle) {
            return ResponseEntity.status(403).body("Bạn không có quyền duyệt yêu cầu gia nhập cho xe này.");
        }
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy xe");
        }
        
        User targetUser = userRepository.findById(userId).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy người dùng");
        }
        
        if (!vehicleId.equals(targetUser.getRequestedVehicleId())) {
            return ResponseEntity.badRequest().body("Người dùng không gửi yêu cầu xin vào xe này");
        }
        
        targetUser.setVehicle(vehicle);
        targetUser.setOwnershipPercentage(0.0);
        targetUser.setRequestedVehicleId(null);
        userRepository.save(targetUser);
        
        return ResponseEntity.ok(Map.of("message", "Đã duyệt yêu cầu gia nhập thành công!"));
    }

    @PostMapping("/vehicles/{vehicleId}/reject-join/{userId}")
    @Transactional
    public ResponseEntity<?> rejectJoinRequest(@PathVariable Long vehicleId, @PathVariable Long userId, HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isLeaderOfThisVehicle = Boolean.TRUE.equals(currentUser.getIsGroupLeader()) 
                && currentUser.getVehicle() != null 
                && currentUser.getVehicle().getId().equals(vehicleId);
                
        if (!isAdmin && !isLeaderOfThisVehicle) {
            return ResponseEntity.status(403).body("Bạn không có quyền từ chối yêu cầu gia nhập cho xe này.");
        }
        
        User targetUser = userRepository.findById(userId).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.badRequest().body("Không tìm thấy người dùng");
        }
        
        if (!vehicleId.equals(targetUser.getRequestedVehicleId())) {
            return ResponseEntity.badRequest().body("Người dùng không gửi yêu cầu xin vào xe này");
        }
        
        targetUser.setRequestedVehicleId(null);
        userRepository.save(targetUser);
        
        return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu gia nhập!"));
    }

    @PostMapping("/users/deposit-wallet")
    @Transactional
    public ResponseEntity<?> depositWallet(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        Object amountObj = payload.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().body("Thiếu số tiền nạp");
        }
        
        double amount = Double.parseDouble(amountObj.toString());
        if (amount <= 0) {
            return ResponseEntity.badRequest().body("Số tiền nạp phải lớn hơn 0");
        }
        
        double currentWallet = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        user.setWalletBalance(currentWallet + amount);
        userRepository.save(user);
        
        Transaction tx = Transaction.builder()
                .user(user)
                .type("DEPOSIT")
                .categoryName("Nạp ví cá nhân")
                .amount(amount)
                .date(java.time.LocalDate.now())
                .description("Nạp tiền vào ví cá nhân trực tuyến")
                .status("PAID")
                .build();
        transactionRepository.save(tx);
        
        return ResponseEntity.ok(Map.of(
            "message", "Nạp tiền vào ví cá nhân thành công!",
            "newBalance", user.getWalletBalance()
        ));
    }
}
