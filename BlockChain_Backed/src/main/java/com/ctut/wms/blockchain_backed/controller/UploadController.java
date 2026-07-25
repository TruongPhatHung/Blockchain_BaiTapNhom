package com.ctut.wms.blockchain_backed.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    // Khai báo thư mục lưu ảnh (sẽ tự động tạo ở thư mục gốc của dự án backend)
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Tệp tin không được để trống.");
            }

            // 1. Tạo thư mục nếu chưa tồn tại
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. Tạo tên file mới (dùng UUID để tránh trùng tên khi nhiều người cùng up ảnh)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + extension;

            // 3. Lưu file vào ổ cứng
            Path filePath = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(filePath, file.getBytes());

            // 4. Trả về đường dẫn thật để Frontend có thể lấy ảnh
            String realUrl = "http://localhost:8080/uploads/" + newFilename;

            Map<String, String> response = new HashMap<>();
            response.put("url", realUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi lưu file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi máy chủ: " + e.getMessage());
        }
    }
}