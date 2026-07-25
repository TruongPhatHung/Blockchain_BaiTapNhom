package com.ctut.wms.blockchain_backed.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class BlockchainUtil {

    /**
     * Hàm số 1: Nhận trực tiếp một chuỗi dữ liệu (dataToHash) đã được ghép sẵn
     * và trả về mã băm SHA-256 (64 ký tự).
     */
    public static String calculateHash(String dataToHash) {
        try {
            // 1. Khởi tạo thuật toán SHA-256
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));

            // 2. Chuyển đổi mảng byte thành chuỗi Hex (hệ 16)
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

    /**
     * Hàm số 2: Nhận vào 5 thông tin giao dịch rời rạc.
     * Hàm này sẽ tự động ghép chuỗi và gọi lại Hàm số 1 để lấy kết quả.
     */
    public static String calculateHash(String senderAccount, String receiverAccount, String amount, String timestamp, String previousHash) {
        // Ghép nối dữ liệu thành một chuỗi duy nhất
        String combinedData = senderAccount + receiverAccount + amount + timestamp + previousHash;

        // Gọi lại hàm calculateHash(String dataToHash) ở trên để xử lý
        return calculateHash(combinedData);
    }
}