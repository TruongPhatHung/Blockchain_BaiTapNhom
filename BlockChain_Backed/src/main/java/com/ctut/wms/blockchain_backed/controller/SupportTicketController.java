package com.ctut.wms.blockchain_backed.controller;

import com.ctut.wms.blockchain_backed.entity.SupportTicket;
import com.ctut.wms.blockchain_backed.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository ticketRepository;

    // API: Người dùng gửi yêu cầu hỗ trợ (Ghi nhận sự cố)
    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@RequestBody SupportTicket ticket) {
        try {
            // Trong thực tế, bạn sẽ lấy User từ Token đăng nhập. Ở đây lưu trực tiếp từ JSON gửi lên.
            SupportTicket savedTicket = ticketRepository.save(ticket);
            return ResponseEntity.ok(savedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo yêu cầu hỗ trợ: " + e.getMessage());
        }
    }

    // API: Nhân viên xem danh sách sự cố đang chờ xử lý
    @GetMapping("/pending")
    public ResponseEntity<List<SupportTicket>> getPendingTickets() {
        return ResponseEntity.ok(ticketRepository.findByStatus("PENDING"));
    }

    // API: Nhân viên cập nhật trạng thái đã giải quyết
    @PutMapping("/resolve/{ticketId}")
    public ResponseEntity<?> resolveTicket(@PathVariable Long ticketId, @RequestParam Long staffId) {
        try {
            SupportTicket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã yêu cầu hỗ trợ"));

            ticket.setStatus("RESOLVED");
            ticket.setHandledBy(staffId); // Ghi nhận nhân viên nào đã xử lý

            ticketRepository.save(ticket);
            return ResponseEntity.ok("Đã giải quyết thành công sự cố!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}