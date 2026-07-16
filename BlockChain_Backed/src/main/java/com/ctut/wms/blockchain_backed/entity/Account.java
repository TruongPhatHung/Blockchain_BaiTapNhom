package com.ctut.wms.blockchain_backed.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    // Liên kết: Nhiều tài khoản (Account) có thể thuộc về 1 Người dùng (User)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false, length = 20)
    private String accountNumber;

    @Column(precision = 18, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(length = 50)
    private String accountType = "THANH_TOAN"; // 'THANH_TOAN' hoặc 'TIET_KIEM'
    @Column(unique = true, length = 19) // Chiều dài chuẩn của thẻ VISA/MasterCard (bao gồm khoảng trắng)
    private String cardNumber;


    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


}
