package com.ctut.wms.blockchain_backed.service;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.repository.AccountRepository;
import com.ctut.wms.blockchain_backed.repository.TransactionRepository;
import com.ctut.wms.blockchain_backed.util.BlockchainUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Annotation @Transactional đảm bảo nếu có lỗi ở bất kỳ bước nào, toàn bộ quá trình sẽ bị hủy (Rollback)
    @Transactional
    public Transaction transferMoney(String senderAccountNumber, String receiverAccountNumber, BigDecimal amount, String description) {

        // 1. Kiểm tra số tiền hợp lệ
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền giao dịch phải lớn hơn 0");
        }

        // 2. Tìm tài khoản người gửi và người nhận trong DB
        Account sender = accountRepository.findByAccountNumber(senderAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));

        Account receiver = accountRepository.findByAccountNumber(receiverAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người nhận"));

        // 3. Kiểm tra số dư người gửi
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư không đủ để thực hiện giao dịch");
        }

        // 4. Cập nhật số dư (Off-chain)
        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        // 5. Khởi tạo dữ liệu giao dịch mới (On-chain)
        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount(receiverAccountNumber);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType("CHUYEN_TIEN");
        newTransaction.setDescription(description);

        // Sử dụng thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        newTransaction.setTimestamp(now);

        // 6. Lấy mã băm của khối (giao dịch) cuối cùng để làm sợi xích nối
        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa có khối Khởi nguồn (Genesis Block)"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        // 7. Đào khối: Tính toán mã băm cho giao dịch mới này
        String newBlockHash = BlockchainUtil.calculateHash(
                senderAccountNumber,
                receiverAccountNumber,
                amount.toString(),
                now.toString(),
                previousHash
        );

        newTransaction.setBlockHash(newBlockHash);

        // 8. Lưu khối mới vào CSDL (Hoàn tất giao dịch)
        return transactionRepository.save(newTransaction);
    }
    /**
     * Hàm chạy kiểm tra tính toàn vẹn của toàn bộ sổ cái (Dành cho Admin)
     */
    public boolean verifyBlockchainIntegrity() {
        // Lấy tất cả giao dịch sắp xếp theo thứ tự ID tăng dần (từ cũ đến mới)
        List<Transaction> chain = transactionRepository.findAll(org.springframework.data.domain.Sort.by("transactionId").ascending());

        // Bỏ qua khối đầu tiên (Genesis Block), bắt đầu kiểm tra từ khối số 1
        for (int i = 1; i < chain.size(); i++) {
            Transaction currentBlock = chain.get(i);
            Transaction previousBlock = chain.get(i - 1);

            // Kiểm tra 1: Móc xích có bị đứt không?
            if (!currentBlock.getPreviousHash().equals(previousBlock.getBlockHash())) {
                System.out.println("CẢNH BÁO: Lỗi móc xích tại khối ID: " + currentBlock.getTransactionId());
                return false;
            }

            // Kiểm tra 2: Dữ liệu bên trong có bị sửa đổi lén lút không?
            // Tiến hành băm lại dữ liệu hiện tại đang nằm dưới database
            String recalculatedHash = BlockchainUtil.calculateHash(
                    currentBlock.getSenderAccount(),
                    currentBlock.getReceiverAccount(),
                    currentBlock.getAmount().toString(),
                    currentBlock.getTimestamp().toString(),
                    currentBlock.getPreviousHash()
            );

            // Nếu mã băm tính lại KHÔNG khớp với mã băm đã lưu -> Bị hack!
            if (!currentBlock.getBlockHash().equals(recalculatedHash)) {
                System.out.println("CẢNH BÁO: Dữ liệu đã bị thay đổi trái phép tại khối ID: " + currentBlock.getTransactionId());
                return false;
            }
        }

        System.out.println("HỆ THỐNG AN TOÀN: Dữ liệu toàn vẹn.");
        return true;
    }

    /**
     * Hàm xử lý Nạp tiền (Hệ thống chuyển tiền vào tài khoản người dùng)
     */
    @Transactional
    public Transaction depositMoney(String receiverAccountNumber, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0");
        }

        Account receiver = accountRepository.findByAccountNumber(receiverAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người nhận"));

        // Cộng tiền cho người nhận
        receiver.setBalance(receiver.getBalance().add(amount));
        accountRepository.save(receiver);

        // Tạo khối giao dịch mới
        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount("SYSTEM_DEPOSIT"); // Người gửi là Hệ thống
        newTransaction.setReceiverAccount(receiverAccountNumber);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType("NAP_TIEN");
        newTransaction.setDescription(description);

        LocalDateTime now = LocalDateTime.now();
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Genesis Block"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        // Đào khối
        String newBlockHash = BlockchainUtil.calculateHash("SYSTEM_DEPOSIT", receiverAccountNumber, amount.toString(), now.toString(), previousHash);
        newTransaction.setBlockHash(newBlockHash);

        return transactionRepository.save(newTransaction);
    }

    /**
     * Hàm lấy lịch sử giao dịch của một người
     */
    public List<Transaction> getTransactionHistory(String accountNumber) {
        return transactionRepository.findBySenderAccountOrReceiverAccountOrderByTimestampDesc(accountNumber, accountNumber);
    }
    @Transactional
    public Transaction payBill(String senderAccountNumber, String billerCode, BigDecimal amount, String billType, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền thanh toán phải lớn hơn 0");
        }

        Account sender = accountRepository.findByAccountNumber(senderAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư không đủ để thanh toán hóa đơn");
        }

        // Trừ tiền người gửi (Tiền chuyển vào tài khoản định danh của nhà cung cấp)
        sender.setBalance(sender.getBalance().subtract(amount));
        accountRepository.save(sender);

        // Tạo khối giao dịch thanh toán
        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount("BILLER_" + billerCode); // Mã nhà cung cấp
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType(billType); // 'TIEN_DIEN', 'TIEN_NUOC', 'NAP_4G'...
        newTransaction.setDescription(description);

        LocalDateTime now = LocalDateTime.now();
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy khối neo."));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        String newBlockHash = BlockchainUtil.calculateHash(senderAccountNumber, "BILLER_" + billerCode, amount.toString(), now.toString(), previousHash);
        newTransaction.setBlockHash(newBlockHash);

        return transactionRepository.save(newTransaction);
    }
}