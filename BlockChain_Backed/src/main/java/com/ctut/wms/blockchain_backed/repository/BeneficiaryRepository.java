package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.Beneficiary;
import com.ctut.wms.blockchain_backed.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    // Lấy danh sách người nhận gần đây của một User cụ thể
    List<Beneficiary> findByUser(User user);
}