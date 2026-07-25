package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;       // Đã thêm thư viện Map
import java.util.HashMap;   // Đã thêm thư viện HashMap

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private TransactionService transactionService;

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
             * Thực hiện việc: Tìm Khối theo txId -> Cập nhật amount/description mới -> LƯU THẲNG VÀO DB MÀ KHÔNG CẬP NHẬT LẠI HASH.
             */
            java.math.BigDecimal newAmount = new java.math.BigDecimal(tamperedData.get("amount").toString());
            String newDescription = tamperedData.get("description").toString();

            // Gọi service
            transactionService.tamperTransactionData(txId, newAmount, newDescription);

            return ResponseEntity.ok("Đã ghi đè dữ liệu giả mạo thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi giả mạo dữ liệu: " + e.getMessage());
        }
    }

    /**
     * API: Kiểm tra tính minh bạch hệ thống
     * GET /api/admin/verify-blockchain
     */
    @GetMapping("/verify-blockchain")
    public ResponseEntity<?> verifySystem() {
        // Lấy danh sách ID bị lỗi
        List<Long> tamperedIds = transactionService.getTamperedTransactionIds();

        if (tamperedIds.isEmpty()) {
            // Không có ID nào bị lỗi -> Xanh tươi
            return ResponseEntity.ok("Hệ thống an toàn. Dữ liệu toàn vẹn chỉnh chu.");
        } else {
            // Có lỗi -> Đóng gói câu thông báo + Danh sách ID vào JSON gửi về ReactJS
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "CẢNH BÁO: Phát hiện dữ liệu sổ cái đã bị thay đổi trái phép!");
            errorResponse.put("tamperedIds", tamperedIds);

            return ResponseEntity.status(400).body(errorResponse);
        }
    }
}