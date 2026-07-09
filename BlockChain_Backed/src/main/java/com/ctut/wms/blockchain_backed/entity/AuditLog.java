package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Column(nullable = false)
    private String actionType; // 'DANG_NHAP_SAI', 'KHOA_TAI_KHOAN', 'HOAN_TAC_GD'

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String performedBy; // Username của người thực hiện hành động

    @Column(updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // Getters and Setters
}