package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class AccountStatisticsController {

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getStatistics(@PathVariable String accountNumber) {
        BigDecimal totalIncome = transactionRepository.calculateTotalIncome(accountNumber);
        BigDecimal totalExpense = transactionRepository.calculateTotalExpense(accountNumber);

        Map<String, BigDecimal> stats = new HashMap<>();
        stats.put("totalIncome", totalIncome);
        stats.put("totalExpense", totalExpense);

        return ResponseEntity.ok(stats);
    }
}