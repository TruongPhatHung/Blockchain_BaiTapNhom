package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private TransactionService transactionService;

    // API: Kiểm tra tính minh bạch hệ thống
    @GetMapping("/verify-blockchain")
    public ResponseEntity<?> verifySystem() {
        boolean isValid = transactionService.verifyBlockchainIntegrity();

        if (isValid) {
            return ResponseEntity.ok("Hệ thống an toàn. Dữ liệu toàn vẹn chỉnh chu.");
        } else {
            return ResponseEntity.status(400).body("CẢNH BÁO: Phát hiện dữ liệu sổ cái đã bị thay đổi trái phép!");
        }
    }
    // ... Các code cũ trong AdminController.java

    @Autowired
    private com.ctut.wms.blockchain_backed.repository.AuditLogRepository auditLogRepository;

    // API: Admin xem nhật ký hệ thống
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        // Sắp xếp log mới nhất lên đầu
        return ResponseEntity.ok(auditLogRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp")));
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
        // Dùng chung hàm getAllTransactions giống như /database-rows
        List<Transaction> ledger = transactionService.getAllTransactions();
        return ResponseEntity.ok(ledger);
    }

    /**

     * PUT /api/admin/tamper/{txId}
     */
    @PutMapping("/tamper/{txId}")
    public ResponseEntity<?> tamperTransaction(@PathVariable Long txId, @RequestBody java.util.Map<String, Object> tamperedData) {
        try {
            /*

             * để thực hiện việc: Tìm Khối theo txId -> Cập nhật amount/description mới -> LƯU THẲNG VÀO DB MÀ KHÔNG CẬP NHẬT LẠI HASH.
             */
            java.math.BigDecimal newAmount = new java.math.BigDecimal(tamperedData.get("amount").toString());
            String newDescription = tamperedData.get("description").toString();

            // Gọi service (bạn cần tự định nghĩa hàm này trong TransactionService)
            transactionService.tamperTransactionData(txId, newAmount, newDescription);

            return ResponseEntity.ok("Đã ghi đè dữ liệu giả mạo thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi giả mạo dữ liệu: " + e.getMessage());
        }
    }
}