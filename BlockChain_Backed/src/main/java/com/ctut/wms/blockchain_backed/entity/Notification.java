package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    // Liên kết: Thông báo này gửi cho ai?
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title; // Tiêu đề thông báo (VD: "Biến động số dư")

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // Nội dung chi tiết (VD: "Bạn vừa nhận được 50,000 VND...")

    @Column(nullable = false)
    private Boolean isRead = false; // Đánh dấu đã đọc hay chưa (chưa đọc thì quả chuông hiện chấm đỏ)

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Thời gian nhận thông báo


}