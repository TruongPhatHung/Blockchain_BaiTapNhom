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
            @RequestBody java.util.Map<String, Object> tamperedData
    ) {
        try {
            // Lấy dữ liệu an toàn, kiểm tra null trước khi chuyển đổi
            BigDecimal newAmount = null;
            if (tamperedData.get("amount") != null) {
                // Ép kiểu an toàn từ mọi định dạng (String, Integer, Double) sang BigDecimal
                newAmount = new BigDecimal(tamperedData.get("amount").toString());
            }

            String newDescription = null;
            if (tamperedData.get("description") != null) {
                newDescription = tamperedData.get("description").toString();
            }

            // Gọi xuống Service để lưu
            transactionService.tamperTransactionData(txId, newAmount, newDescription);

            return ResponseEntity.ok("Đã ghi đè dữ liệu giả mạo thành công!");
        } catch (Exception e) {
            e.printStackTrace(); // In chi tiết lỗi ra màn hình đen để dễ gỡ rối
            return ResponseEntity.badRequest().body("Lỗi khi giả mạo dữ liệu: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/verify-blockchain
     */
    @GetMapping("/verify-blockchain")
    public ResponseEntity<List<Map<String, Object>>> verifySystem() {
        // Lấy báo cáo đối soát chi tiết từ TransactionService
        List<Map<String, Object>> auditReport = transactionService.getBlockchainAuditReport();

        // Trả về dữ liệu dạng JSON với mã trạng thái 200 OK
        return ResponseEntity.ok(auditReport);
    }
    /**
     * POST /api/admin/restore/{txId}
     */
    @PostMapping("/restore/{txId}")
    public ResponseEntity<?> restoreBlock(@PathVariable Long txId) {
        try {
            transactionService.restoreTamperedBlock(txId);
            return ResponseEntity.ok("Khôi phục dữ liệu Khối #" + txId + " thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi khôi phục: " + e.getMessage());
        }
    }


}
