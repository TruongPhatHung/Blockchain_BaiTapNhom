package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    // Tìm các yêu cầu hỗ trợ theo trạng thái (VD: Tìm tất cả 'PENDING')
    List<SupportTicket> findByStatus(String status);
}