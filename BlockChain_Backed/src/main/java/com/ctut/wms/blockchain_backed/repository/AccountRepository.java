package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // Tìm tài khoản ngân hàng dựa vào số tài khoản
    Optional<Account> findByAccountNumber(String accountNumber);
}