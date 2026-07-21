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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private com.ctut.wms.blockchain_backed.service.TransactionService transactionService;

    // API: Xem danh sách toàn bộ khách hàng
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // ĐÃ SỬA: Chỉ lọc và trả về những người dùng có quyền 'USER'
        List<User> customers = userRepository.findAll().stream()
                .filter(user -> "USER".equals(user.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
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

    // API: Nhân viên tạo lệnh hoàn tác (Đền bù giao dịch lỗi)
    @PostMapping("/transactions/reverse")
    public ResponseEntity<?> reverseTransaction(@RequestBody Map<String, Object> request) {
        try {
            // ĐÃ SỬA: Kiểm tra dữ liệu đầu vào để tránh lỗi NullPointerException làm sập server
            if (!request.containsKey("originalReceiverAccount") ||
                    !request.containsKey("originalSenderAccount") ||
                    !request.containsKey("amount")) {
                return ResponseEntity.badRequest().body("Thiếu thông tin giao dịch cần hoàn tác!");
            }

            String senderToReverse = request.get("originalReceiverAccount").toString();
            String receiverToCredit = request.get("originalSenderAccount").toString();
            BigDecimal amountToReverse = new BigDecimal(request.get("amount").toString());

            String errorTxId = request.containsKey("originalTransactionId")
                    ? request.get("originalTransactionId").toString()
                    : "N/A";

            String description = "LỆNH HOÀN TÁC cho giao dịch lỗi ID: " + errorTxId;
            String receiverBankName = "Lumina Bank";
            String category = "HOAN_TIEN";

            // LƯU Ý: Hiện tại hàm này vẫn đang gọi transferMoney (sẽ tạo giao dịch PENDING chờ MetaMask).
            com.ctut.wms.blockchain_backed.entity.Transaction reversedBlock = transactionService.transferMoney(
                    senderToReverse,
                    receiverToCredit,
                    receiverBankName,
                    amountToReverse,
                    category,
                    description
            );

            return ResponseEntity.ok(reversedBlock);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể hoàn tác: " + e.getMessage());
        }
    }
}