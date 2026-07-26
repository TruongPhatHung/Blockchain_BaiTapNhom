package com.ctut.wms.blockchain_backed.controller;
import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.repository.AuditLogRepository;
import com.ctut.wms.blockchain_backed.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class Admincontroller {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // API: Admin xem nhật ký hệ thống
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(
                auditLogRepository.findAll(
                        org.springframework.data.domain.Sort.by(
                                org.springframework.data.domain.Sort.Direction.DESC,
                                "timestamp"
                        )
                )
        );
    }

    @GetMapping("/database-rows")
    public ResponseEntity<List<Transaction>> getRawDatabaseRows() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * GET /api/admin/ledger
     */
    @GetMapping("/ledger")
    public ResponseEntity<List<Transaction>> getAdminLedger() {
        List<Transaction> ledger = transactionService.getAllTransactions();
        return ResponseEntity.ok(ledger);
    }

    /**
     * PUT /api/admin/tamper/{txId}
     */
    @PutMapping("/tamper/{txId}")
    public ResponseEntity<?> tamperTransaction(
            @PathVariable Long txId,
            @RequestBody Map<String, Object> tamperedData
    ) {
        try {
            BigDecimal newAmount = new BigDecimal(tamperedData.get("amount").toString());
            String newDescription = tamperedData.get("description").toString();

            transactionService.tamperTransactionData(txId, newAmount, newDescription);

            return ResponseEntity.ok("Đã ghi đè dữ liệu giả mạo thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi giả mạo dữ liệu: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/verify-blockchain
     */
    @GetMapping("/verify-blockchain")
    public ResponseEntity<?> verifySystem() {
        List<Long> tamperedIds = transactionService.getTamperedTransactionIds();

        if (tamperedIds.isEmpty()) {
            return ResponseEntity.ok("Hệ thống an toàn. Dữ liệu toàn vẹn chỉnh chu.");
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("message", "CẢNH BÁO: Phát hiện dữ liệu sổ cái đã bị thay đổi trái phép!");
        errorResponse.put("tamperedIds", tamperedIds);

        return ResponseEntity.status(400).body(errorResponse);
    }
}
