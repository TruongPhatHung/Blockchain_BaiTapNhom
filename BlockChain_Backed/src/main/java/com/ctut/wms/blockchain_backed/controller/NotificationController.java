package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Notification;
import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.NotificationRepository;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // API lấy danh sách thông báo của một người dùng
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    // API đánh dấu một thông báo là "Đã đọc" (Khi người dùng click vào quả chuông)
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok("Đã đánh dấu đọc");
    }
}