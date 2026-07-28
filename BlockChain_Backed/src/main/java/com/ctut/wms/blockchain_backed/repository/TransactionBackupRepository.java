package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.TransactionBackup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface TransactionBackupRepository extends JpaRepository<TransactionBackup, Long> {
}
