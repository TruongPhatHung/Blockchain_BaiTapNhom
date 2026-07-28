// Đường dẫn: src/main/java/.../entity/TransactionBackup.java
package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "transaction_backup")
public class TransactionBackup {

    @Id
    private Long transactionId; // Dùng chung ID với Transaction chính

    private String senderAccount;
    private String receiverAccount;
    private BigDecimal amount;
    private String description;
    private String blockHash;
    private String previousHash;
    private LocalDateTime timestamp;


}