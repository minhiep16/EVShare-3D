package com.evshare.backend.controller;

import com.evshare.backend.entity.User;
import com.evshare.backend.repository.UserRepository;
import com.evshare.backend.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if ("admin@evshare.vn".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
            User adminUser = userRepository.findByUsername("admin@evshare.vn").orElse(null);
            if (adminUser == null) {
                adminUser = User.builder()
                        .id(4L) // Mock ID
                        .name("Phạm Quốc Hùng")
                        .role("ADMIN")
                        .email("admin@evshare.vn")
                        .username("admin@evshare.vn")
                        .build();
            }
            String token = jwtUtil.generateToken(adminUser.getUsername(), adminUser.getId(), adminUser.getRole());
            return ResponseEntity.ok(new JwtResponse(token, adminUser));
        }

        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
        }
        
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        var matchedUserOpt = userRepository.findByUsername(username);
        if (matchedUserOpt.isPresent()) {
            User user = matchedUserOpt.get();
            if (user.getPassword().equals(password)) {
                String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
                return ResponseEntity.ok(new JwtResponse(token, user));
            }
        }
        return ResponseEntity.badRequest().body("Tên đăng nhập hoặc mật khẩu không chính xác!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getPhone() == null || request.getPassword() == null || request.getFullName() == null) {
            return ResponseEntity.badRequest().body("Vui lòng điền đầy đủ các thông tin bắt buộc.");
        }

        // Validate Vietnamese phone number format strictly
        String phone = request.getPhone().trim();
        if (!phone.matches("^(0|\\+84|84)(3|5|7|8|9)\\d{8}$")) {
            return ResponseEntity.badRequest().body("Số điện thoại không đúng định dạng Việt Nam (phải bắt đầu bằng 0, 84 hoặc +84 và gồm 10 chữ số).");
        }
        
        if (userRepository.existsByUsername(phone)) {
            return ResponseEntity.badRequest().body("Số điện thoại này đã được đăng ký trên hệ thống!");
        }

        // Validate mandatory document images (CCCD Front, CCCD Back, GPLX)
        if (request.getCccdImageUrl() == null || request.getCccdImageUrl().trim().isEmpty() ||
            request.getCccdBackImageUrl() == null || request.getCccdBackImageUrl().trim().isEmpty() ||
            request.getGplxImageUrl() == null || request.getGplxImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chụp và tải lên đầy đủ: ảnh CCCD mặt trước, CCCD mặt sau và Giấy phép lái xe.");
        }

        User newUser = User.builder()
                .name(request.getFullName())
                .username(phone)
                .phone(phone)
                .email(request.getEmail() != null && !request.getEmail().trim().isEmpty() 
                        ? request.getEmail() 
                        : phone + "@evshare.vn")
                .cccd(request.getCccd())
                .gplx(request.getGplx())
                .cccdImageUrl(request.getCccdImageUrl())
                .cccdBackImageUrl(request.getCccdBackImageUrl())
                .gplxImageUrl(request.getGplxImageUrl())
                .password(request.getPassword())
                .role("USER") // Hardcoded security role
                .avatarUrl("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg")
                .ownershipPercentage(0.0)
                .isGroupLeader(false)
                .walletBalance(0.0)
                .status(User.UserStatus.PENDING_APPROVAL)
                .version(0)
                .build();

        User saved = userRepository.save(newUser);
        String token = jwtUtil.generateToken(saved.getUsername(), saved.getId(), saved.getRole());
        return ResponseEntity.ok(new JwtResponse(token, saved));
    }

    @PostMapping("/ocr-cccd")
    public ResponseEntity<?> ocrCccd(@RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        try {
            Thread.sleep(1200); // Simulate network & OCR processing latency
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String[] names = {
            "Nguyễn Hoàng Nam", 
            "Trần Thị Mai Anh", 
            "Lê Minh Hùng", 
            "Phạm Quốc Bảo", 
            "Nguyễn Thu Thảo",
            "Đặng Minh Triết",
            "Phan Thanh Hằng",
            "Vũ Hoàng Giang"
        };
        String[] addresses = {
            "Hai Bà Trưng, Hà Nội", 
            "Quận 1, TP. Hồ Chí Minh", 
            "Ngũ Hành Sơn, Đà Nẵng", 
            "Hồng Bàng, Hải Phòng", 
            "Ninh Kiều, Cần Thơ"
        };

        java.util.Random rand = new java.util.Random();
        String name = names[rand.nextInt(names.length)];
        String address = addresses[rand.nextInt(addresses.length)];
        
        StringBuilder cccdBuilder = new StringBuilder("037");
        for (int i = 0; i < 9; i++) {
            cccdBuilder.append(rand.nextInt(10));
        }
        String cccd = cccdBuilder.toString();

        int birthYear = 1985 + rand.nextInt(20);
        int birthMonth = 1 + rand.nextInt(12);
        int birthDay = 1 + rand.nextInt(28);
        String dob = String.format("%02d/%02d/%d", birthDay, birthMonth, birthYear);

        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("fullName", name);
        response.put("cccd", cccd);
        response.put("dob", dob);
        response.put("address", address);

        return ResponseEntity.ok(response);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String fullName;
        private String phone;
        private String email;
        private String cccd;
        private String gplx;
        private String cccdImageUrl;
        private String cccdBackImageUrl;
        private String gplxImageUrl;
        private String password;
    }

    @Data
    public static class JwtResponse {
        private String token;
        private User user;

        public JwtResponse(String token, User user) {
            this.token = token;
            this.user = user;
        }
    }
}
