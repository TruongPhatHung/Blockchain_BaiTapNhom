package com.ctut.wms.blockchain_backed.repository;

import com.ctut.wms.blockchain_backed.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Boot sẽ tự động viết câu lệnh SQL tìm người dùng theo tên đăng nhập
    Optional<User> findByUsername(String username);
}