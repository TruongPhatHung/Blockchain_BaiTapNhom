package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.Notification;
import com.ctut.wms.blockchain_backed.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Hàm này giúp lấy toàn bộ thông báo của một người dùng, sắp xếp từ mới nhất đến cũ nhất
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Hàm này đếm xem người dùng có bao nhiêu thông báo chưa đọc (để hiển thị số màu đỏ trên quả chuông)
    long countByUserAndIsReadFalse(User user);
}