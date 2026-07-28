package com.ctut.wms.blockchain_backed.service;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.entity.Notification;
import com.ctut.wms.blockchain_backed.entity.Transaction;
import com.ctut.wms.blockchain_backed.entity.TransactionBackup;
import com.ctut.wms.blockchain_backed.repository.AccountRepository;
import com.ctut.wms.blockchain_backed.repository.NotificationRepository;
import com.ctut.wms.blockchain_backed.repository.TransactionBackupRepository;
import com.ctut.wms.blockchain_backed.repository.TransactionRepository;
import com.ctut.wms.blockchain_backed.util.BlockchainUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    @Autowired
    private TransactionBackupRepository backupRepository;

    /**
     * HÀM BẢO VỆ CHUỖI SỐ: Cắt bỏ các số 0 vô nghĩa ở đuôi (VD: 0.0200 -> 0.02)
     */
    private String formatAmountForHash(BigDecimal amount) {
        if (amount == null) return "0";
        return amount.stripTrailingZeros().toPlainString();
    }

    // TẠO GIAO DỊCH CHỜ KÝ METAMASK
    @Transactional
    public Transaction transferMoney(String senderAccountNumber, String receiverAccountNumber, String receiverBankName, BigDecimal amount, String category, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền giao dịch phải lớn hơn 0");
        }

        Account sender = accountRepository.findByAccountNumber(senderAccountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));

        if (receiverBankName == null || receiverBankName.equalsIgnoreCase("Lumina Bank")) {
            accountRepository.findByAccountNumber(receiverAccountNumber)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người nhận nội bộ"));
        }

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư không đủ để thực hiện giao dịch");
        }

        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount(receiverAccountNumber);
        newTransaction.setReceiverBankName(receiverBankName);
        newTransaction.setCategory(category);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType("CHUYEN_TIEN");
        newTransaction.setDescription(description);
        newTransaction.setStatus("PENDING");

        // ĐÃ SỬA: Cắt bỏ phần lẻ mili-giây để CSDL lưu trữ và Java đồng nhất 100%
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa có khối Khởi nguồn (Genesis Block)"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        String newBlockHash = BlockchainUtil.calculateHash(
                senderAccountNumber,
                receiverAccountNumber,
                formatAmountForHash(amount), // Dùng hàm an toàn
                description,
                now.toString(),
                previousHash
        );
        newTransaction.setBlockHash(newBlockHash);

        Transaction savedTx = transactionRepository.save(newTransaction);
        createBackup(savedTx);
        return savedTx;
    }

    // METAMASK BÁO THÀNH CÔNG -> TIẾN HÀNH TRỪ TIỀN
    @Transactional
    public Transaction confirmTransaction(Long transactionId, String onChainTxHash) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        if (!"PENDING".equals(tx.getStatus())) {
            throw new RuntimeException("Giao dịch này đã được xử lý!");
        }

        Account sender = accountRepository.findByAccountNumber(tx.getSenderAccount())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người gửi"));
        sender.setBalance(sender.getBalance().subtract(tx.getAmount()));
        accountRepository.save(sender);

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

        tx.setStatus("SUCCESS");
        tx.setOnChainTxHash(onChainTxHash);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction recordOnChainTransfer(String senderWallet, String receiverWallet,
                                             BigDecimal amount, String description,
                                             String onChainTxHash) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền giao dịch phải lớn hơn 0");
        }

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
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
                senderWallet, receiverWallet, formatAmountForHash(amount), description, now.toString(), previousHash));

        Transaction savedTx = transactionRepository.save(transaction);
        createBackup(savedTx);
        return savedTx;
    }

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
                    formatAmountForHash(currentBlock.getAmount()),
                    currentBlock.getDescription(),
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
        newTransaction.setStatus("SUCCESS");

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Genesis Block"));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        String newBlockHash = BlockchainUtil.calculateHash("SYSTEM_DEPOSIT", receiverAccountNumber, formatAmountForHash(amount), description, now.toString(), previousHash);
        newTransaction.setBlockHash(newBlockHash);

        Transaction savedTx = transactionRepository.save(newTransaction);
        createBackup(savedTx);
        return savedTx;
    }

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

        sender.setBalance(sender.getBalance().subtract(amount));
        accountRepository.save(sender);

        Transaction newTransaction = new Transaction();
        newTransaction.setSenderAccount(senderAccountNumber);
        newTransaction.setReceiverAccount("BILLER_" + billerCode);
        newTransaction.setAmount(amount);
        newTransaction.setTransactionType(billType);
        newTransaction.setDescription(description);
        newTransaction.setStatus("SUCCESS");

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        newTransaction.setTimestamp(now);

        Transaction lastTransaction = transactionRepository.findLastTransaction()
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy khối neo."));

        String previousHash = lastTransaction.getBlockHash();
        newTransaction.setPreviousHash(previousHash);

        String newBlockHash = BlockchainUtil.calculateHash(senderAccountNumber, "BILLER_" + billerCode, formatAmountForHash(amount), description, now.toString(), previousHash);
        newTransaction.setBlockHash(newBlockHash);

        Transaction savedTx = transactionRepository.save(newTransaction);
        createBackup(savedTx);
        return savedTx;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional
    public void tamperTransactionData(Long txId, BigDecimal newAmount, String newDescription) {
        Transaction tx = transactionRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch ID: " + txId));

        System.out.println("🚨 [HỆ THỐNG CẢNH BÁO] - CÓ KẺ ĐANG THAO TÚNG DATABASE!");
        System.out.println("- Khối mục tiêu: #" + txId);

        if (newAmount != null) tx.setAmount(newAmount);
        if (newDescription != null) tx.setDescription(newDescription);

        transactionRepository.save(tx);
    }

    public List<Long> getTamperedTransactionIds() {
        List<Long> tamperedIds = new ArrayList<>();
        List<Transaction> allTransactions = transactionRepository.findAll();

        for (Transaction tx : allTransactions) {
            String calculatedHash = BlockchainUtil.calculateHash(
                    tx.getSenderAccount(),
                    tx.getReceiverAccount(),
                    formatAmountForHash(tx.getAmount()),
                    tx.getDescription(),
                    tx.getTimestamp().toString(),
                    tx.getPreviousHash()
            );

            if (!calculatedHash.equals(tx.getBlockHash())) {
                tamperedIds.add(tx.getTransactionId());
            }
        }
        return tamperedIds;
    }

    @Transactional
    public void restoreTamperedBlock(Long txId) {
        TransactionBackup backup = backupRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản sao lưu của khối này!"));

        Transaction corruptedTx = transactionRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));

        corruptedTx.setAmount(backup.getAmount());
        corruptedTx.setDescription(backup.getDescription());
        corruptedTx.setBlockHash(backup.getBlockHash());

        transactionRepository.save(corruptedTx);
    }

    /**
     * HÀM ĐỐI SOÁT CHUẨN BLOCKCHAIN
     */
    public java.util.List<java.util.Map<String, Object>> getBlockchainAuditReport() {
        java.util.List<java.util.Map<String, Object>> report = new java.util.ArrayList<>();
        java.util.List<Transaction> currentChain = transactionRepository.findAll(org.springframework.data.domain.Sort.by("transactionId").ascending());

        for (int i = 0; i < currentChain.size(); i++) {
            Transaction currentTx = currentChain.get(i);
            java.util.Map<String, Object> item = new java.util.HashMap<>();

            item.put("blockIndex", i + 1);
            item.put("transactionId", currentTx.getTransactionId());

            // ÉP TÍNH LẠI HASH VỚI DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA
            String recalculatedHash = BlockchainUtil.calculateHash(
                    currentTx.getSenderAccount(),
                    currentTx.getReceiverAccount(),
                    formatAmountForHash(currentTx.getAmount()), // Cắt số 0 dư thừa
                    currentTx.getDescription(),
                    currentTx.getTimestamp().toString(),
                    currentTx.getPreviousHash()
            );

            TransactionBackup backupTx = backupRepository.findById(currentTx.getTransactionId()).orElse(null);
            String originalHash = (backupTx != null) ? backupTx.getBlockHash() : currentTx.getBlockHash();
            boolean isTampered = !recalculatedHash.equals(originalHash);

            java.util.Map<String, Object> dbData = new java.util.HashMap<>();
            dbData.put("accountNumber", currentTx.getReceiverAccount());
            dbData.put("amount", currentTx.getAmount());
            dbData.put("description", currentTx.getDescription());
            dbData.put("onChainTxHash", currentTx.getOnChainTxHash());
            item.put("dbData", dbData);

            java.util.Map<String, Object> blockchainData = new java.util.HashMap<>();
            if (backupTx != null) {
                blockchainData.put("accountNumber", backupTx.getReceiverAccount());
                blockchainData.put("amount", backupTx.getAmount());
                blockchainData.put("description", backupTx.getDescription());
                blockchainData.put("onChainTxHash", currentTx.getOnChainTxHash());
            } else {
                blockchainData = dbData;
            }

            item.put("blockchainData", blockchainData);
            item.put("currentHash", recalculatedHash);
            item.put("originalHash", originalHash);
            item.put("previousHash", currentTx.getPreviousHash());
            item.put("isTampered", isTampered);

            report.add(item);
        }
        return report;
    }

    private void createBackup(Transaction savedTx) {
        TransactionBackup backup = new TransactionBackup();
        backup.setTransactionId(savedTx.getTransactionId());
        backup.setSenderAccount(savedTx.getSenderAccount());
        backup.setReceiverAccount(savedTx.getReceiverAccount());
        backup.setAmount(savedTx.getAmount());
        backup.setDescription(savedTx.getDescription());
        backup.setBlockHash(savedTx.getBlockHash());
        backup.setPreviousHash(savedTx.getPreviousHash());
        backup.setTimestamp(savedTx.getTimestamp());

        backupRepository.save(backup);
    }
    /**
     * HÀM ĐỒNG BỘ TỰ ĐỘNG DỰA TRÊN ID GIAO DỊCH KHI KHỞI ĐỘNG SERVER
     * Dùng ID của bảng transactions làm mốc, kéo dữ liệu chuẩn từ Web3 để cập nhật vào kho Backup.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncBackupFromWeb3OnStartup() {
        System.out.println("🔄 [WEB3 SYNC] Bắt đầu quét danh sách giao dịch để đồng bộ kho Backup với Web3...");

        List<Transaction> allTransactions = transactionRepository.findAll();
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();

        // Sử dụng RPC Node Sepolia công cộng ổn định
        String rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
        int syncCount = 0;

        for (Transaction tx : allTransactions) {
            String onChainHash = tx.getOnChainTxHash();
            BigDecimal syncedAmount = tx.getAmount(); // Mặc định dùng số tiền nội bộ

            // 1. Nếu giao dịch có mã onChainTxHash, tiến hành kéo dữ liệu thật từ mạng Web3
            if (onChainHash != null && onChainHash.startsWith("0x")) {
                try {
                    String requestJson = String.format("{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionByHash\",\"params\":[\"%s\"],\"id\":1}", onChainHash);

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

                    ResponseEntity<String> response = restTemplate.postForEntity(rpcUrl, entity, String.class);
                    JsonNode root = mapper.readTree(response.getBody());
                    JsonNode resultNode = root.path("result");

                    if (!resultNode.isMissingNode() && !resultNode.isNull()) {
                        String valueHex = resultNode.path("value").asText();
                        if (valueHex.startsWith("0x")) {
                            valueHex = valueHex.substring(2);
                        }
                        BigInteger wei = new BigInteger(valueHex, 16);
                        // Quy đổi từ Wei sang Ether (Chuẩn xác 100% so với Etherscan)
                        syncedAmount = new BigDecimal(wei).divide(new BigDecimal("1000000000000000000"));
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Không thể kết nối Web3 cho khối ID #" + tx.getTransactionId() + ". Giữ nguyên dữ liệu dự phòng.");
                }
            }

            // 2. Lưu vào bảng Backup, lấy chính xác transactionId làm khóa chính để khớp với bảng chính
            TransactionBackup backup = backupRepository.findById(tx.getTransactionId()).orElse(new TransactionBackup());
            backup.setTransactionId(tx.getTransactionId()); // Dựa vào ID của transaction chính
            backup.setSenderAccount(tx.getSenderAccount());
            backup.setReceiverAccount(tx.getReceiverAccount());
            backup.setAmount(syncedAmount); // Đã được đồng bộ chuẩn từ Web3
            backup.setDescription(tx.getDescription());
            backup.setBlockHash(tx.getBlockHash());
            backup.setPreviousHash(tx.getPreviousHash());
            backup.setTimestamp(tx.getTimestamp());
            backup.setOnChainTxHash(onChainHash);

            backupRepository.save(backup);
            syncCount++;
        }
        System.out.println("✅ [WEB3 SYNC] Đã đồng bộ thành công " + syncCount + " khối vào kho Backup dựa trên ID giao dịch!");
    }
    /**
     * HÀM TỰ ĐỘNG QUÉT VÀ ĐỒNG BỘ TẤT CẢ CÁC VÍ TRONG HỆ THỐNG
     * Tự động tìm các địa chỉ ví (bắt đầu bằng 0x) từ DB nội bộ rồi kéo dữ liệu từ Etherscan về.
     */
    @Transactional
    public void autoSyncAllWalletsFromBlockchain() {
        System.out.println("🔄 [WEB3 SYNC] Đang quét các địa chỉ ví trong hệ thống để đồng bộ...");

        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();

        // 1. TỰ ĐỘNG TÌM KIẾM: Lấy tất cả các địa chỉ ví bắt đầu bằng "0x" từ bảng giao dịch nội bộ
        List<Transaction> allTx = transactionRepository.findAll();
        java.util.Set<String> uniqueWallets = new java.util.HashSet<>();

        for (Transaction tx : allTx) {
            if (tx.getSenderAccount() != null && tx.getSenderAccount().startsWith("0x")) {
                uniqueWallets.add(tx.getSenderAccount());
            }
            if (tx.getReceiverAccount() != null && tx.getReceiverAccount().startsWith("0x")) {
                uniqueWallets.add(tx.getReceiverAccount());
            }
        }

        if (uniqueWallets.isEmpty()) {
            System.out.println("⚠️ [WEB3 SYNC] Không tìm thấy địa chỉ ví Ethereum nào trong hệ thống để đồng bộ.");
            return;
        }

        // 2. DUYỆT QUA TỪNG VÍ VÀ GỌI API ETHERSCAN
        for (String walletAddress : uniqueWallets) {
            System.out.println("🔍 Đang đồng bộ cho ví: " + walletAddress);

            // Link gọi API Etherscan Sepolia (Dùng khóa chung 'YourApiKeyToken' hoặc key miễn phí của bạn)
            String apiUrl = String.format("https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=%s&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken", walletAddress);

            try {
                ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
                JsonNode root = mapper.readTree(response.getBody());

                String status = root.path("status").asText();
                if ("1".equals(status)) {
                    JsonNode transactions = root.path("result");
                    int syncCount = 0;

                    for (JsonNode txNode : transactions) {
                        String hash = txNode.path("hash").asText();
                        String from = txNode.path("from").asText();
                        String to = txNode.path("to").asText();
                        String valueWei = txNode.path("value").asText();
                        String timeStampStr = txNode.path("timeStamp").asText();

                        BigDecimal etherAmount = new BigDecimal(valueWei).divide(new BigDecimal("1000000000000000000"));
                        long timestamp = Long.parseLong(timeStampStr);
                        LocalDateTime txTime = LocalDateTime.ofEpochSecond(timestamp, 0, java.time.ZoneOffset.UTC);

                        // Kiểm tra xem giao dịch này đã có trong kho Backup chưa (dựa vào onChainTxHash)
                        boolean exists = backupRepository.findAll().stream()
                                .anyMatch(b -> b.getOnChainTxHash() != null && hash.equalsIgnoreCase(b.getOnChainTxHash()));

                        if (!exists) {
                            TransactionBackup backup = new TransactionBackup();
                            backup.setTransactionId(System.currentTimeMillis() + syncCount);
                            backup.setSenderAccount(from);
                            backup.setReceiverAccount(to);
                            backup.setAmount(etherAmount);
                            backup.setDescription("Đồng bộ tự động từ Etherscan Web3");
                            backup.setOnChainTxHash(hash);
                            backup.setTimestamp(txTime);

                            backupRepository.save(backup);
                            syncCount++;
                        }
                    }
                    System.out.println("✅ Đã đồng bộ thành công " + syncCount + " giao dịch cho ví " + walletAddress);
                }
            } catch (Exception e) {
                System.err.println("❌ Lỗi khi đồng bộ ví " + walletAddress + ": " + e.getMessage());
            }
        }
        System.out.println("✅ [WEB3 SYNC] Hoàn tất quá trình quét và đồng bộ toàn bộ hệ thống ví!");
    }
}