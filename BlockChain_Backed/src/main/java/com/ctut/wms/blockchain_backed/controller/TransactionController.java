package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.dto.TransferRequest;
import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.repository.TransactionRepository;
import com.ctut.wms.blockchain_backed.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Cho phép Frontend (Node.js/React/Vue) gọi API mà không bị chặn lỗi CORS
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * API 1: Thực hiện giao dịch chuyển tiền
     * POST /api/transactions/transfer
     */
    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@RequestBody TransferRequest request) {
        try {
            // Gọi Service để xử lý nghiệp vụ trừ tiền và tạo khối
            Transaction newBlock = transactionService.transferMoney(
                    request.getSenderAccountNumber(),
                    request.getReceiverAccountNumber(),
                    request.getAmount(),
                    request.getDescription()
            );

            // Nếu thành công, trả về khối giao dịch vừa tạo
            return ResponseEntity.ok(newBlock);

        } catch (Exception e) {
            // Nếu có lỗi (VD: không đủ số dư), trả về mã lỗi 400 và thông báo
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * API 2: Lấy toàn bộ danh sách khối (Sổ cái Blockchain)
     * GET /api/transactions/ledger
     */
    @GetMapping("/ledger")
    public ResponseEntity<List<Transaction>> getLedger() {
        // Trả về toàn bộ dữ liệu trong bảng transactions để Frontend vẽ sơ đồ khối
        List<Transaction> ledger = transactionRepository.findAll();
        return ResponseEntity.ok(ledger);
    }

    // API: Nạp tiền
    @PostMapping("/deposit")
    public ResponseEntity<?> depositMoney(@RequestBody TransferRequest request) {
        try {
            Transaction newBlock = transactionService.depositMoney(
                    request.getReceiverAccountNumber(),
                    request.getAmount(),
                    request.getDescription()
            );
            return ResponseEntity.ok(newBlock);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xem lịch sử giao dịch cá nhân
    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<?> getHistory(@PathVariable String accountNumber) {
        try {
            List<Transaction> history = transactionService.getTransactionHistory(accountNumber);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/pay-bill")
    public ResponseEntity<?> payBill(@RequestBody Map<String, Object> request) {
        try {
            Transaction block = transactionService.payBill(
                    request.get("senderAccountNumber").toString(),
                    request.get("billerCode").toString(),
                    new BigDecimal(request.get("amount").toString()),
                    request.get("billType").toString(), // Loại hóa đơn
                    request.get("description").toString()
            );
            return ResponseEntity.ok(block);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}