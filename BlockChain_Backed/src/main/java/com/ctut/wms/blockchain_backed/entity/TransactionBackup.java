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
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "sender_account")
    private String senderAccount;

    @Column(name = "receiver_account")
    private String receiverAccount;

    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "block_hash")
    private String blockHash;

    @Column(name = "previous_hash")
    private String previousHash;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    @Column(name = "on_chain_tx_hash")
    private String onChainTxHash;

}