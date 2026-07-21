package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import com.ctut.wms.blockchain_backed.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;
    // API: Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Kiểm tra trạng thái tài khoản
            if ("LOCKED".equals(user.getStatus())) {
                return ResponseEntity.status(403).body("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
            }
            // Kiểm tra mật khẩu (đơn giản hóa)
            if (user.getPasswordHash().equals(password)) {

                // 1. TẠO RA TOKEN BẰNG JWT UTIL
                String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

                // 2. ĐÓNG GÓI CẢ TOKEN VÀ USER ĐỂ GỬI VỀ CHO REACTJS
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("token", token);
                responseData.put("user", user);

                return ResponseEntity.ok(responseData);
            }
        }
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu.");
    }
}