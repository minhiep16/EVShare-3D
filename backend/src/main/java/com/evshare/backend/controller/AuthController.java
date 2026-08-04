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
        
        if (userRepository.existsByUsername(request.getPhone())) {
            return ResponseEntity.badRequest().body("Số điện thoại này đã được đăng ký trên hệ thống!");
        }

        User newUser = User.builder()
                .name(request.getFullName())
                .username(request.getPhone())
                .phone(request.getPhone())
                .email(request.getEmail() != null && !request.getEmail().trim().isEmpty() 
                        ? request.getEmail() 
                        : request.getPhone() + "@evshare.vn")
                .cccd(request.getCccd())
                .gplx(request.getGplx())
                .password(request.getPassword())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .avatarUrl(request.getRole() != null && request.getRole().equals("ADMIN") 
                        ? "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg" 
                        : "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg")
                .ownershipPercentage(0.0)
                .build();

        User saved = userRepository.save(newUser);
        String token = jwtUtil.generateToken(saved.getUsername(), saved.getId(), saved.getRole());
        return ResponseEntity.ok(new JwtResponse(token, saved));
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
        private String password;
        private String role;
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
