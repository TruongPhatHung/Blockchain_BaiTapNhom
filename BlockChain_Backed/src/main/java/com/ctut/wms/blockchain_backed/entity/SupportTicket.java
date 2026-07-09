package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người dùng báo cáo sự cố

    @Column(name = "transaction_id")
    private Long transactionId; // ID giao dịch bị lỗi (có thể null nếu lỗi khác)

    @Column(nullable = false, length = 100)
    private String issueType; // VD: 'GIAO_DICH_LOI', 'KHOA_TAI_KHOAN'

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 50)
    private String status = "PENDING"; // 'PENDING' (Chờ xử lý), 'RESOLVED' (Đã giải quyết)

    @Column(name = "handled_by")
    private Long handledBy; // ID của nhân viên xử lý

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Bạn nhớ dùng IDE tạo Getters và Setters cho các trường này nhé!
}