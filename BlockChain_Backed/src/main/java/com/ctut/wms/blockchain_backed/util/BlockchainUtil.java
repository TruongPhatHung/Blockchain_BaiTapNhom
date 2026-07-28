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
     * HÀM CŨ (5 THAM SỐ): Nhận vào 5 thông tin giao dịch rời rạc.
     * Vẫn giữ lại để đảm bảo không làm hỏng các phần code cũ khác (nếu có).
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

    /**
     * HÀM MỚI NÂNG CẤP (6 THAM SỐ): Bổ sung thêm 'description'
     * Hàm này được dùng cho chuẩn bảo mật Blockchain mới nhất của hệ thống.
     */
    public static String calculateHash(
            String senderAccount,
            String receiverAccount,
            String amount,
            String description,
            String timestamp,
            String previousHash
    ) {
        // Xử lý an toàn: Nếu description bị null (không có nội dung) thì đổi thành chuỗi rỗng
        String safeDescription = (description != null) ? description : "";

        // Ghép toàn bộ 6 mảnh thông tin lại với nhau
        String combinedData = senderAccount + receiverAccount + amount + safeDescription + timestamp + previousHash;

        // Chuyển khối dữ liệu đã ghép cho hàm lõi SHA-256 ở trên cùng xử lý
        return calculateHash(combinedData);
    }
}