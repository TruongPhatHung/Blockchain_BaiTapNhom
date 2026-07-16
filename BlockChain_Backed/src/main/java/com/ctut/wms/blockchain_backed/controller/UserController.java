package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // API: Lấy thông tin chi tiết của người dùng
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Cập nhật thông tin Cài đặt (Settings) từ Frontend gửi lên
    @PutMapping("/{username}/settings")
    public ResponseEntity<?> updateUserSettings(@PathVariable String username, @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Kiểm tra và cập nhật các trường nếu Frontend có gửi dữ liệu lên
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email").toString());
            }
            if (updates.containsKey("phoneNumber")) {
                user.setPhoneNumber(updates.get("phoneNumber").toString());
            }
            if (updates.containsKey("avatarUrl")) {
                user.setAvatarUrl(updates.get("avatarUrl").toString());
            }
            if (updates.containsKey("isBiometricEnabled")) {
                user.setIsBiometricEnabled((Boolean) updates.get("isBiometricEnabled"));
            }
            if (updates.containsKey("isNotificationEnabled")) {
                user.setIsNotificationEnabled((Boolean) updates.get("isNotificationEnabled"));
            }

            // Lưu lại vào Cơ sở dữ liệu
            userRepository.save(user);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật: " + e.getMessage());
        }
    }
}