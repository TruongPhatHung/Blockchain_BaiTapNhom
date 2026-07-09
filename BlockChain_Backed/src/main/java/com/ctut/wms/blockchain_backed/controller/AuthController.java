package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // API: Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password"); // Thực tế cần mã hóa mật khẩu

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Kiểm tra trạng thái tài khoản
            if ("LOCKED".equals(user.getStatus())) {
                return ResponseEntity.status(403).body("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
            }
            // Kiểm tra mật khẩu (đơn giản hóa)
            if (user.getPasswordHash().equals(password)) {
                return ResponseEntity.ok(user); // Trả về thông tin user (thay vì JWT cho đơn giản)
            }
        }
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu.");
    }
}