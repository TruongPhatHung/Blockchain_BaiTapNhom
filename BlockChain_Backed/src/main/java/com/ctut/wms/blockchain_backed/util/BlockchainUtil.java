package com.ctut.wms.blockchain_backed.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class BlockchainUtil {

    // Hàm nhận vào các thông tin giao dịch và trả về chuỗi mã băm 64 ký tự
    public static String calculateHash(String senderAccount, String receiverAccount, String amount, String timestamp, String previousHash) {
        try {
            // 1. Ghép nối dữ liệu thành một chuỗi duy nhất
            String dataToHash = senderAccount + receiverAccount + amount + timestamp + previousHash;

            // 2. Khởi tạo thuật toán SHA-256
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));

            // 3. Chuyển đổi mảng byte thành chuỗi Hex (hệ 16)
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0'); // Thêm 0 đằng trước nếu thiếu để đảm bảo đủ 64 ký tự
                }
                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi khởi tạo mã băm SHA-256", e);
        }
    }
}