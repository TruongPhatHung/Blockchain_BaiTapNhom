package com.ctut.wms.blockchain_backed.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String role; // 'USER', 'STAFF', 'ADMIN'

    @Column(length = 20)
    private String status = "ACTIVE"; // 'ACTIVE' hoặc 'LOCKED'

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl; // Đường dẫn ảnh đại diện

    @Column(name = "is_biometric_enabled")
    private Boolean isBiometricEnabled = false; // Nút gạt Sinh trắc học

    @Column(name = "is_notification_enabled")
    private Boolean isNotificationEnabled = true; // Nút gạt Thông báo
    // --- TRƯỜNG MỚI BỔ SUNG: HẠNG TÀI KHOẢN ---
    @Column(name = "account_tier", length = 20)
    private String accountTier = "STANDARD"; // Mặc định là hạng Thường (STANDARD), có thể nâng lên PREMIUM

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();



}
