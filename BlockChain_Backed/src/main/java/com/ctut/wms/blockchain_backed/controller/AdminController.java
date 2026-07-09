package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}