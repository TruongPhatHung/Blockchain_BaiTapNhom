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
    public ResponseEntity<?> transferMoney(@RequestBody Map<String, Object> requestData) {
        try {
            // 1. Trích xuất dữ liệu cũ
            String senderAccount = requestData.get("senderAccountNumber").toString();
            String receiverAccount = requestData.get("receiverAccountNumber").toString();
            BigDecimal amount = new BigDecimal(requestData.get("amount").toString());
            String description = requestData.get("description").toString();

            // 2. Trích xuất 2 dữ liệu MỚI (Có xử lý null an toàn nếu web quên gửi)
            String receiverBankName = requestData.containsKey("receiverBankName") ?
                    requestData.get("receiverBankName").toString() : "Lumina Bank";

            String category = requestData.containsKey("category") ?
                    requestData.get("category").toString() : "OTHER";

            // 3. Gọi xuống Service với đầy đủ tham số mới
            Transaction transaction = transactionService.transferMoney(
                    senderAccount,
                    receiverAccount,
                    receiverBankName,
                    amount,
                    category,
                    description
            );

            // Trả về kết quả thành công cho ReactJS
            return ResponseEntity.ok(transaction);

        } catch (Exception e) {
            // Trả về lỗi nếu có (ví dụ: Không đủ tiền, Sai tài khoản...)
            return ResponseEntity.badRequest().body("Lỗi giao dịch: " + e.getMessage());
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