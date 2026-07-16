package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Beneficiary;
import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.BeneficiaryRepository;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiaries")
@CrossOrigin(origins = "*")
public class BeneficiaryController {

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    @Autowired
    private UserRepository userRepository;

    // API: Lấy danh sách người nhận gần đây của một User
    @GetMapping("/{username}")
    public ResponseEntity<?> getSavedContacts(@PathVariable String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            List<Beneficiary> contacts = beneficiaryRepository.findByUser(user);
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // API: Lưu một người nhận mới vào danh bạ (Thường gọi ngầm sau khi chuyển tiền thành công)
    @PostMapping("/{username}")
    public ResponseEntity<?> addContact(@PathVariable String username, @RequestBody Map<String, String> contactData) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Beneficiary newContact = new Beneficiary();
            newContact.setUser(user);
            newContact.setSavedAccountNumber(contactData.get("savedAccountNumber"));
            newContact.setSavedName(contactData.get("savedName"));

            // Các trường không bắt buộc (Có thể null)
            newContact.setNickname(contactData.get("nickname"));
            newContact.setBankName(contactData.get("bankName"));

            beneficiaryRepository.save(newContact);
            return ResponseEntity.ok("Đã lưu vào danh bạ thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thêm danh bạ: " + e.getMessage());
        }
    }
}