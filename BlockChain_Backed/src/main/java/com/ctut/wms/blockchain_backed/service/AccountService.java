package com.ctut.wms.blockchain_backed.service;

import com.ctut.wms.blockchain_backed.entity.Account;
import com.ctut.wms.blockchain_backed.entity.User;
import com.ctut.wms.blockchain_backed.repository.AccountRepository;
import com.ctut.wms.blockchain_backed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
public class AccountService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Transactional
    public Account createNewUserAndAccount(String username, String password, String fullName) {
        // 1. Tạo Người dùng mới
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPasswordHash(password); // Thực tế sẽ cần mã hóa BCrypt, tạm thời lưu chuỗi thuần để dễ hiểu
        newUser.setFullName(fullName);
        newUser.setRole("USER");
        userRepository.save(newUser);

        // 2. Tạo Tài khoản ngân hàng cho người dùng này
        Account newAccount = new Account();
        newAccount.setUser(newUser);
        // Tạo số tài khoản ngẫu nhiên 8 số (VD: 1900xxxx)
        newAccount.setAccountNumber("1900" + (1000 + new Random().nextInt(9000)));
        // Cấp số vốn ban đầu để test
        newAccount.setBalance(new BigDecimal("10000000.00"));
        newAccount.setAccountType("THANH_TOAN");

        return accountRepository.save(newAccount);
    }

    public Account getAccountInfo(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản này!"));
    }
}