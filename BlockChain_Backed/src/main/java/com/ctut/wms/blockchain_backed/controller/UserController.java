package com.ctut.wms.blockchain_backed.controller;

import org.springframework.security.core.Authentication;
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

    // ==========================================
    // API DÀNH CHO KHÁCH HÀNG
    // ==========================================

    // API: Lấy thông tin chi tiết của người dùng
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Cập nhật thông tin Cài đặt (Settings) từ Frontend gửi lên
    @PutMapping("/{username}/settings")
    public ResponseEntity<?> updateUserSettings(
            @PathVariable String username,
            @RequestBody Map<String, Object> updates,
            Authentication authentication
    ) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

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

            userRepository.save(user);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật cài đặt: " + e.getMessage());
        }
    }

    // ==========================================
    // API DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
    // ==========================================

    // ĐÃ BỔ SUNG: API Lấy danh sách toàn bộ người dùng
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            // Lấy toàn bộ danh sách User từ Database và trả về
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách người dùng: " + e.getMessage());
        }
    }

    // API: Cập nhật toàn diện thông tin tài khoản
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserByAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ID người dùng: " + id));

            // Cập nhật các trường thông tin cơ bản
            if (updates.containsKey("fullName")) {
                user.setFullName(updates.get("fullName").toString());
            }
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email").toString());
            }
            if (updates.containsKey("phoneNumber")) {
                user.setPhoneNumber(updates.get("phoneNumber").toString());
            }

            // Cập nhật các trường quản trị
            if (updates.containsKey("role")) {
                user.setRole(updates.get("role").toString());
            }
            if (updates.containsKey("accountTier")) {
                user.setAccountTier(updates.get("accountTier").toString());
            }
            if (updates.containsKey("status")) {
                user.setStatus(updates.get("status").toString());
            }

            // Cập nhật mật khẩu (Chỉ khi Admin có nhập mật khẩu mới vào form)
            if (updates.containsKey("password") && !updates.get("password").toString().trim().isEmpty()) {
                String newPassword = updates.get("password").toString();
                // Lưu ý: Sau này khi tích hợp bảo mật, hãy bọc biến newPassword bằng PasswordEncoder.encode()
                user.setPasswordHash(newPassword);
            }

            // Lưu dữ liệu vào CSDL
            userRepository.save(user);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật tài khoản: " + e.getMessage());
        }
    }
}