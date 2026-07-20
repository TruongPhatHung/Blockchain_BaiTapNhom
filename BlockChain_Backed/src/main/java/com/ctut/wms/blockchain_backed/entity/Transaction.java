package com.ctut.wms.blockchain_backed.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(length = 100)
    private String senderAccount;

    @Column(length = 100)
    private String receiverAccount;

    // --- CÁC TRƯỜNG BỔ SUNG CHO UI TRANSFER & STATISTICS ---
    @Column(length = 100)
    private String receiverBankName; // VD: "ABC Bank", "Lumina Bank"

    @Column(length = 50)
    private String category; // Phân loại để vẽ Pie Chart: "FOOD", "SHOPPING", "TRANSFER"...

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String transactionType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20, nullable = false)
    private String status = "PENDING";

    @Column(name = "on_chain_tx_hash", length = 100)
    private String onChainTxHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false, length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String blockHash;

    //  PHÍ GIAO DỊCH ---
    @Column(precision = 18, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO; // Mặc định phí là 0, phục vụ hiển thị trên UI
}
