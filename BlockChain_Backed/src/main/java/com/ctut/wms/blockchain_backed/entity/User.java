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

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
