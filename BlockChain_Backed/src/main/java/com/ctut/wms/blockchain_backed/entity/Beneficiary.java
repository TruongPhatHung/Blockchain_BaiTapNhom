package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "beneficiaries")
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long beneficiaryId;

    // Liên kết: Người lưu danh bạ này là ai?
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String savedAccountNumber;

    @Column(nullable = false, length = 100)
    private String savedName; // Tên chủ tài khoản đích (VD: NGUYEN VAN A)

    @Column(length = 50)
    private String nickname; // Tên gợi nhớ (VD: Mẹ, Vợ, Tiền nhà)

    @Column(length = 100)
    private String bankName; // Tên ngân hàng đích

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Bạn nhớ dùng IDE tạo Getters và Setters nhé!
}