package com.ctut.wms.blockchain_backed.service;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.entity.Notification;
import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.repository.AccountRepository;
import com.ctut.wms.blockchain_backed.repository.NotificationRepository;
import com.ctut.wms.blockchain_backed.repository.TransactionRepository;
import com.ctut.wms.blockchain_backed.util.BlockchainUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private TransactionRepository transactionRepository;


    // TẠO GIAO DỊCH CHỜ KÝ METAMASK CẬP NHẬT CATEGORY & BANK NAME
    @Transactional
    public Transaction transferMoney(String senderAccountNumber, String receiverAccountNumber, String receiverBankName, BigDecimal amount, String category, String description) {

        // 1. Kiểm tra số tiền hợp lệ
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền giao dịch phải lớn hơn 0");
        }

        // 2. Tìm tài khoản người gửi
        Account sender = accountRepository.findByAccountNumber(senderAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));

        // 3. Xử lý người nhận tùy theo loại hình chuyển khoản
        if (receiverBankName == null || receiverBankName.equalsIgnoreCase("Lumina Bank")) {
            // Nếu là chuyển nội bộ: Bắt buộc phải tìm thấy người nhận trong Database
            accountRepository.findByAccountNumber(receiverAccountNumber)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người nhận nội bộ"));
        }

        // 4. Kiểm tra số dư người gửi (Không trừ tiền ở bước này)
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư không đủ để thực hiện giao dịch");
        }

        // 5. Khởi tạo dữ liệu giao dịch mới (On-chain)
        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount(receiverAccountNumber);

        // --- HAI TRƯỜNG DỮ LIỆU MỚI ---
        newTransaction.setReceiverBankName(receiverBankName); // Lưu tên ngân hàng
        newTransaction.setCategory(category);                 // Lưu danh mục chi tiêu (VD: SHOPPING, FOOD)

        newTransaction.setAmount(amount);
        newTransaction.setTransactionType("CHUYEN_TIEN");
        newTransaction.setDescription(description);
        newTransaction.setStatus("PENDING"); // Đang chờ MetaMask

        LocalDateTime now = LocalDateTime.now();
        newTransaction.setTimestamp(now);

        // 6. Lấy mã băm của khối cuối cùng
        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa có khối Khởi nguồn (Genesis Block)"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        // 7. Đào khối: Tính toán mã băm
        String newBlockHash = BlockchainUtil.calculateHash(
                senderAccountNumber,
                receiverAccountNumber,
                amount.toString(),
                now.toString(),
                previousHash
        );

        newTransaction.setBlockHash(newBlockHash);

        // 8. Lưu hóa đơn chờ vào CSDL
        return transactionRepository.save(newTransaction);
    }

    //  METAMASK BÁO THÀNH CÔNG -> TIẾN HÀNH TRỪ TIỀN
    @Transactional
    public Transaction confirmTransaction(Long transactionId, String onChainTxHash) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        if (!"PENDING".equals(tx.getStatus())) {
            throw new RuntimeException("Giao dịch này đã được xử lý!");
        }

        // 1. Trừ tiền người gửi
        Account sender = accountRepository.findByAccountNumber(tx.getSenderAccount())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));
        sender.setBalance(sender.getBalance().subtract(tx.getAmount()));
        accountRepository.save(sender);

        // 2. An toàn: Chỉ cộng tiền & tạo thông báo nếu người nhận thuộc ngân hàng nội bộ
        accountRepository.findByAccountNumber(tx.getReceiverAccount()).ifPresent(receiver -> {
            receiver.setBalance(receiver.getBalance().add(tx.getAmount()));
            accountRepository.save(receiver);

            Notification notification = new Notification();
            notification.setUser(receiver.getUser());
            notification.setTitle("Biến động số dư");
            notification.setMessage("Tài khoản " + receiver.getAccountNumber() + " vừa nhận được +" + tx.getAmount() + " VND từ " + sender.getAccountNumber());
            notification.setIsRead(false);
            notificationRepository.save(notification);
        });

        // 3. Cập nhật trạng thái giao dịch
        tx.setStatus("SUCCESS");
        tx.setOnChainTxHash(onChainTxHash);

        return transactionRepository.save(tx);
    }

    /**
     * Lưu giao dịch đã được xác nhận trên MetaMask/Sepolia. Luồng này tách biệt
     * với chuyển khoản nội bộ VND vì địa chỉ ví Ethereum không phải số tài khoản.
     */
    @Transactional
    public Transaction recordOnChainTransfer(String senderWallet, String receiverWallet,
                                             BigDecimal amount, String description,
                                             String onChainTxHash) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền giao dịch phải lớn hơn 0");
        }

        LocalDateTime now = LocalDateTime.now();
        String previousHash = transactionRepository.findLastTransaction()
                .map(Transaction::getBlockHash)
                .orElse("GENESIS");

        Transaction transaction = new Transaction();
        transaction.setSenderAccount(senderWallet);
        transaction.setReceiverAccount(receiverWallet);
        transaction.setReceiverBankName("Sepolia");
        transaction.setCategory("ON_CHAIN_TRANSFER");
        transaction.setAmount(amount);
        transaction.setTransactionType("ON_CHAIN_TRANSFER");
        transaction.setDescription(description);
        transaction.setStatus("SUCCESS");
        transaction.setOnChainTxHash(onChainTxHash);
        transaction.setTimestamp(now);
        transaction.setPreviousHash(previousHash);
        transaction.setBlockHash(BlockchainUtil.calculateHash(
                senderWallet, receiverWallet, amount.toPlainString(), now.toString(), previousHash));

        return transactionRepository.save(transaction);
    }

    /**
     * Hàm chạy kiểm tra tính toàn vẹn của toàn bộ sổ cái (Dành cho Admin)
     */
    public boolean verifyBlockchainIntegrity() {
        List<Transaction> chain = transactionRepository.findAll(org.springframework.data.domain.Sort.by("transactionId").ascending());

        for (int i = 1; i < chain.size(); i++) {
            Transaction currentBlock = chain.get(i);
            Transaction previousBlock = chain.get(i - 1);

            if (!currentBlock.getPreviousHash().equals(previousBlock.getBlockHash())) {
                System.out.println("CẢNH BÁO: Lỗi móc xích tại khối ID: " + currentBlock.getTransactionId());
                return false;
            }

            String recalculatedHash = BlockchainUtil.calculateHash(
                    currentBlock.getSenderAccount(),
                    currentBlock.getReceiverAccount(),
                    currentBlock.getAmount().toString(),
                    currentBlock.getTimestamp().toString(),
                    currentBlock.getPreviousHash()
            );

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

        receiver.setBalance(receiver.getBalance().add(amount));
        accountRepository.save(receiver);

        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount("SYSTEM_DEPOSIT");
        newTransaction.setReceiverAccount(receiverAccountNumber);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType("NAP_TIEN");
        newTransaction.setDescription(description);
        newTransaction.setStatus("SUCCESS"); // Nạp tiền nội bộ thành công luôn

        LocalDateTime now = LocalDateTime.now();
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Genesis Block"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

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

    /**THANH TOÁN HÓA ĐƠN*/
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

        sender.setBalance(sender.getBalance().subtract(amount));
        accountRepository.save(sender);

        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount("BILLER_" + billerCode);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType(billType);
        newTransaction.setDescription(description);
        newTransaction.setStatus("SUCCESS"); // Hóa đơn xử lý nội bộ thành công luôn

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
    /**
     * Lấy toàn bộ danh sách giao dịch thô từ cơ sở dữ liệu (Dành cho trang Quản trị Database Editor)
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
    /**

     * Cố tình ghi đè amount/description nhưng KHÔNG tính lại blockHash để mô phỏng bị hack.
     */
    @Transactional
    public void tamperTransactionData(Long txId, BigDecimal newAmount, String newDescription) {
        Transaction tx = transactionRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch ID: " + txId));

        if (newAmount != null) {
            tx.setAmount(newAmount);
        }
        if (newDescription != null) {
            tx.setDescription(newDescription);
        }

        transactionRepository.save(tx);
    }
    // Hàm mới: Trả về danh sách ID của các giao dịch bị sửa lén
    public List<Long> getTamperedTransactionIds() {
        List<Long> tamperedIds = new ArrayList<>();
        List<Transaction> allTransactions = transactionRepository.findAll();

        for (Transaction tx : allTransactions) {
            // Tính toán lại Hash dựa trên dữ liệu hiện tại trong DB
            String dataToHash = tx.getSenderAccount() +
                    tx.getReceiverAccount() +
                    tx.getAmount() +
                    tx.getDescription() +
                    tx.getPreviousHash(); // Thêm các trường bạn dùng để băm

            String calculatedHash = BlockchainUtil.calculateHash(dataToHash); // Dùng class Hash của bạn

            // Nếu Hash tính lại KHÔNG KHỚP với Hash lưu trong DB -> Ghi sổ đen!
            if (!calculatedHash.equals(tx.getBlockHash())) {
                tamperedIds.add(tx.getTransactionId());
            }
        }

        return tamperedIds;
    }
}
