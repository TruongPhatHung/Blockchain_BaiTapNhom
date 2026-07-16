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

    @Column(length = 20)
    private String senderAccount;

    @Column(length = 20)
    private String receiverAccount;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String transactionType; // 'CHUYEN_TIEN', 'NAP_TIEN'

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false, length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String blockHash;

    //Trạng thái giao dịch
    @Column(length = 20, nullable = false)
    private String status = "PENDING";
    //Mã giao dịch thật trên mạng lưới Blockchain công khai
    @Column(name = "on_chain_tx_hash", length = 100)
    private String onChainTxHash;
}
