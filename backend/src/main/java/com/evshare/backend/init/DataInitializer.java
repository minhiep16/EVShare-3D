package com.evshare.backend.init;

import com.evshare.backend.entity.*;
import com.evshare.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private final VoteRepository voteRepository;
    private final SuggestionRepository suggestionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if DB is empty
        if (userRepository.count() == 0) {
            // 1. Users
            User mai = User.builder()
                    .name("Nguyễn Thị Mai")
                    .avatarUrl("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg")
                    .role("USER")
                    .ownershipPercentage(40.0)
                    .username("0912 345 678")
                    .phone("0912 345 678")
                    .email("mai@evshare.vn")
                    .password("12345678")
                    .cccd("079123456789")
                    .gplx("120034567890")
                    .walletBalance(500000.0)
                    .build();

            User binh = User.builder()
                    .name("Trần Văn Bình")
                    .avatarUrl("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg")
                    .role("USER")
                    .ownershipPercentage(30.0)
                    .username("0912222222")
                    .phone("0912222222")
                    .email("binh@evshare.vn")
                    .password("12345678")
                    .cccd("079111222333")
                    .gplx("120011122233")
                    .walletBalance(200000.0)
                    .build();

            User tuan = User.builder()
                    .name("Lê Minh Tuấn")
                    .avatarUrl("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg")
                    .role("USER")
                    .ownershipPercentage(30.0)
                    .username("0912333333")
                    .phone("0912333333")
                    .email("tuan@evshare.vn")
                    .password("12345678")
                    .cccd("079444555666")
                    .gplx("120044455566")
                    .walletBalance(1500000.0)
                    .build();

            User admin = User.builder()
                    .name("Phạm Quốc Hùng")
                    .avatarUrl("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg")
                    .role("ADMIN")
                    .ownershipPercentage(0.0)
                    .username("admin@evshare.vn")
                    .phone("0909999999")
                    .email("admin@evshare.vn")
                    .password("admin123")
                    .cccd("079987654321")
                    .gplx("120098765432")
                    .walletBalance(0.0)
                    .build();

            userRepository.saveAll(List.of(mai, binh, tuan, admin));

            // 2. Vehicle
            Vehicle vehicle = Vehicle.builder()
                    .model("Tesla Model 3")
                    .licensePlate("51G-888.99")
                    .batteryPercentage(78)
                    .odometer(12400.0)
                    .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1200&auto=format&fit=crop")
                    .jointFundBalance(15000000.0)
                    .build();
            vehicleRepository.save(vehicle);

            // 3. Bookings for June 2025
            Booking booking1 = Booking.builder()
                    .user(mai)
                    .vehicle(vehicle)
                    .startTime(LocalDateTime.of(2025, 6, 10, 8, 0))
                    .endTime(LocalDateTime.of(2025, 6, 10, 18, 0))
                    .purpose("Đi làm hằng ngày")
                    .build();

            Booking booking2 = Booking.builder()
                    .user(binh)
                    .vehicle(vehicle)
                    .startTime(LocalDateTime.of(2025, 6, 11, 9, 0))
                    .endTime(LocalDateTime.of(2025, 6, 11, 17, 0))
                    .purpose("Đi gặp đối tác")
                    .build();

            Booking booking3 = Booking.builder()
                    .user(mai)
                    .vehicle(vehicle)
                    .startTime(LocalDateTime.of(2025, 6, 13, 9, 0))
                    .endTime(LocalDateTime.of(2025, 6, 13, 12, 0))
                    .purpose("Đi công tác Q.1")
                    .build();

            Booking booking4 = Booking.builder()
                    .user(tuan)
                    .vehicle(vehicle)
                    .startTime(LocalDateTime.of(2025, 6, 14, 10, 0))
                    .endTime(LocalDateTime.of(2025, 6, 14, 20, 0))
                    .purpose("Đi dã ngoại cuối tuần")
                    .build();

            Booking booking5 = Booking.builder()
                    .user(mai)
                    .vehicle(vehicle)
                    .startTime(LocalDateTime.of(2025, 6, 16, 14, 0))
                    .endTime(LocalDateTime.of(2025, 6, 16, 17, 0))
                    .purpose("Đón con")
                    .build();

            bookingRepository.saveAll(List.of(booking1, booking2, booking3, booking4, booking5));

            // 4. Transactions matching Q2/2025 total of 7,350,000₫ and donut percentages:
            // Phí sạc điện (45%) -> 3,307,500₫
            // Bảo dưỡng (25%) -> 1,837,500₫
            // Bảo hiểm (20%) -> 1,470,000₫
            // Khác (10%) -> 735,000₫ (represented by Đăng kiểm 1.2M and Vệ sinh 375k in transaction log)
            Transaction t1 = Transaction.builder()
                    .type("CHARGE")
                    .categoryName("Sạc điện")
                    .amount(1125000.0)
                    .date(LocalDate.of(2025, 6, 8))
                    .description("Sạc điện")
                    .status("PAID")
                    .build();

            Transaction t2 = Transaction.builder()
                    .type("MAINTENANCE")
                    .categoryName("Bảo dưỡng")
                    .amount(800000.0)
                    .date(LocalDate.of(2025, 6, 5))
                    .description("Bảo dưỡng")
                    .status("PAID")
                    .build();

            Transaction t3 = Transaction.builder()
                    .type("INSURANCE")
                    .categoryName("Bảo hiểm")
                    .amount(700000.0)
                    .date(LocalDate.of(2025, 6, 1))
                    .description("Bảo hiểm")
                    .status("PAID")
                    .build();

            Transaction t4 = Transaction.builder()
                    .type("OTHER")
                    .categoryName("Đăng kiểm")
                    .amount(1200000.0)
                    .date(LocalDate.of(2025, 6, 15))
                    .description("Đăng kiểm")
                    .status("PENDING")
                    .build();

            Transaction t5 = Transaction.builder()
                    .type("OTHER")
                    .categoryName("Vệ sinh xe")
                    .amount(375000.0)
                    .date(LocalDate.of(2025, 5, 28))
                    .description("Vệ sinh xe")
                    .status("PAID")
                    .build();

            Transaction t6 = Transaction.builder()
                    .type("CHARGE")
                    .categoryName("Sạc điện")
                    .amount(950000.0)
                    .date(LocalDate.of(2025, 5, 20))
                    .description("Sạc điện")
                    .status("PAID")
                    .build();

            // Additional historic transactions to reach Q2 totals:
            Transaction t7 = Transaction.builder()
                    .type("CHARGE")
                    .categoryName("Sạc điện")
                    .amount(1232500.0)
                    .date(LocalDate.of(2025, 4, 15))
                    .description("Sạc điện tháng 4")
                    .status("PAID")
                    .build();

            Transaction t8 = Transaction.builder()
                    .type("MAINTENANCE")
                    .categoryName("Bảo dưỡng")
                    .amount(1037500.0)
                    .date(LocalDate.of(2025, 5, 10))
                    .description("Bảo dưỡng định kỳ")
                    .status("PAID")
                    .build();

            Transaction t9 = Transaction.builder()
                    .type("INSURANCE")
                    .categoryName("Bảo hiểm")
                    .amount(770000.0)
                    .date(LocalDate.of(2025, 5, 1))
                    .description("Phí bảo hiểm trách nhiệm")
                    .status("PAID")
                    .build();

            transactionRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8, t9));

            // 5. Votes
            Vote vote = Vote.builder()
                    .title("Nâng cấp pin xe")
                    .description("Nâng cấp pin xe – 2/3 đồng ý")
                    .agreedCount(2)
                    .totalCount(3)
                    .status("OPEN")
                    .build();
            voteRepository.save(vote);

            // 6. Suggestions
            Suggestion s1 = Suggestion.builder()
                    .content("Bạn đang sử dụng 12% ít hơn tỉ lệ sở hữu (40%). Bạn có thể đặt thêm 2 chuyến trong tháng này.")
                    .type("INFO")
                    .iconClass("ph-chart-line-up")
                    .build();

            Suggestion s2 = Suggestion.builder()
                    .content("Chi phí sạc điện tháng này cao hơn 15% so với tháng trước. Cân nhắc sạc vào khung giờ thấp điểm.")
                    .type("WARNING")
                    .iconClass("ph-warning-circle")
                    .build();

            Suggestion s3 = Suggestion.builder()
                    .content("Quỹ bảo dưỡng đang đủ cho 2 lần bảo dưỡng tới. Nhắc nhở ngày hạn để tránh phí phạt.")
                    .type("SUCCESS")
                    .iconClass("ph-piggy-bank")
                    .build();

            suggestionRepository.saveAll(List.of(s1, s2, s3));
        }
    }
}
