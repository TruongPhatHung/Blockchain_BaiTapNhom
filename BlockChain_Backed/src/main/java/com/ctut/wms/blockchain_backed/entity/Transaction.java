package com.ctut.wms.blockchain_backed.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor  // Bổ sung: Constructor không tham số cho JPA
@AllArgsConstructor // Bổ sung: Constructor đầy đủ tham số
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
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 64)
    private String previousHash;

    @Column(nullable = false, length = 64)
    private String blockHash;

    // --- PHÍ GIAO DỊCH ---
    @Column(precision = 18, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO;

    // Tự động gán thời gian ngay trước khi lưu mới vào Database
    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    /**
     * HÀM BỔ SUNG: Tự tính toán mã băm SHA-256 dựa trên dữ liệu của khối
     * Phục vụ cho hàm verifyBlockchainIntegrity() ở Backend vô cùng tiện lợi!
     */
    public String calculateHash() {
        String dataToHash = previousHash +
                (senderAccount != null ? senderAccount : "") +
                (receiverAccount != null ? receiverAccount : "") +
                amount.toPlainString() +
                (description != null ? description : "");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : bytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính toán mã Hash!", e);
        }
    }
}