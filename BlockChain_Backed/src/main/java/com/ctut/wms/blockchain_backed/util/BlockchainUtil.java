package com.ctut.wms.blockchain_backed.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class BlockchainUtil {

    /**
     * Hàm nhận trực tiếp một chuỗi dữ liệu đã được ghép sẵn
     * và trả về mã băm SHA-256 (64 ký tự).
     */
    public static String calculateHash(String dataToHash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi khởi tạo mã băm SHA-256", e);
        }
    }

    /**
     * Hàm nhận vào 5 thông tin giao dịch rời rạc.
     * Hàm này sẽ tự động ghép chuỗi và gọi lại hàm băm 1 tham số ở trên.
     */
    public static String calculateHash(
            String senderAccount,
            String receiverAccount,
            String amount,
            String timestamp,
            String previousHash
    ) {
        String combinedData = senderAccount + receiverAccount + amount + timestamp + previousHash;
        return calculateHash(combinedData);
    }
}