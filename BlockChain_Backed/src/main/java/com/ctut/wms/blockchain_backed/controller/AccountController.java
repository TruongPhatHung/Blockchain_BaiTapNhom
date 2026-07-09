package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    // API: Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            Account newAccount = accountService.createNewUserAndAccount(
                    request.get("username"),
                    request.get("password"),
                    request.get("fullName")
            );
            return ResponseEntity.ok(newAccount);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xem số dư
    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getBalance(@PathVariable String accountNumber) {
        try {
            Account account = accountService.getAccountInfo(accountNumber);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}