package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Câu lệnh SQL thuần để lấy ra giao dịch (khối) có ID lớn nhất (mới nhất)
    @Query(value = "SELECT * FROM transactions ORDER BY transaction_id DESC LIMIT 1", nativeQuery = true)
    Optional<Transaction> findLastTransaction();

    // Lấy lịch sử giao dịch của một tài khoản cụ thể (Dù là người gửi hay người nhận)
    List<Transaction> findBySenderAccountOrReceiverAccountOrderByTimestampDesc(String senderAccount, String receiverAccount);

    // Tính tổng tiền CHI (Tiền gửi đi) của một tài khoản
    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE sender_account = :accountNumber", nativeQuery = true)
    BigDecimal calculateTotalExpense(@Param("accountNumber") String accountNumber);

    // Tính tổng tiền THU (Tiền nhận về) của một tài khoản
    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE receiver_account = :accountNumber", nativeQuery = true)
    BigDecimal calculateTotalIncome(@Param("accountNumber") String accountNumber);
}