package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.AccountRepository;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    // API: Xem danh sách toàn bộ khách hàng
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // Thực tế nên phân trang, ở đây lấy tất cả user có role là 'USER'
        return ResponseEntity.ok(userRepository.findAll());
    }

    // API: Xem chi tiết tài khoản của khách hàng
    @GetMapping("/accounts/{accountNumber}")
    public ResponseEntity<?> getAccountDetails(@PathVariable String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Khóa / Mở khóa tài khoản khách hàng
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> changeUserStatus(@PathVariable Long userId, @RequestParam String status) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Chỉ chấp nhận 'ACTIVE' hoặc 'LOCKED'
            if (!status.equals("ACTIVE") && !status.equals("LOCKED")) {
                return ResponseEntity.badRequest().body("Trạng thái không hợp lệ.");
            }

            user.setStatus(status);
            userRepository.save(user);
            return ResponseEntity.ok("Đã cập nhật trạng thái người dùng thành: " + status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @Autowired
    private com.ctut.wms.blockchain_backed.service.TransactionService transactionService;

    // API: Nhân viên tạo lệnh hoàn tác (Đền bù giao dịch lỗi)
    @PostMapping("/transactions/reverse")
    public ResponseEntity<?> reverseTransaction(@RequestBody Map<String, Object> request) {
        try {
            // Lệnh hoàn tác bản chất là một lệnh chuyển tiền đặc biệt
            // Từ tài khoản B (người nhận sai) trả lại tiền cho A (người gửi)
            String senderToReverse = request.get("originalReceiverAccount").toString();
            String receiverToCredit = request.get("originalSenderAccount").toString();
            BigDecimal amountToReverse = new BigDecimal(request.get("amount").toString());
            String errorTxId = request.get("originalTransactionId").toString();

            String description = "LỆNH HOÀN TÁC cho giao dịch lỗi ID: " + errorTxId;

            // Gọi TransactionService để thực hiện chuyển tiền ngược lại
            com.ctut.wms.blockchain_backed.entity.Transaction reversedBlock = transactionService.transferMoney(
                    senderToReverse,
                    receiverToCredit,
                    amountToReverse,
                    description
            );

            return ResponseEntity.ok(reversedBlock);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể hoàn tác: " + e.getMessage());
        }
    }


}