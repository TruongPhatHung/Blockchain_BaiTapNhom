// src/pages/Staff/SupportTickets.jsx
import React, { useState, useEffect } from 'react';
import staffService from '../../services/staff.service';
import './SupportTickets.css'; // Chỉ gọi CSS của riêng nó

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await staffService.getSupportTickets();
                setTickets(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách sự cố:", error);
                setTickets([
                    { id: 101, username: 'nguyenvana', issue: 'Chuyển tiền bị trừ nhưng đầu kia chưa nhận được', date: '2026-07-09' },
                    { id: 102, username: 'tranthib', issue: 'Quên mã PIN thanh toán hóa đơn', date: '2026-07-08' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleResolve = async (ticketId) => {
        if (!window.confirm('Xác nhận đã xử lý xong sự cố này?')) return;
        try {
            await staffService.resolveTicket(ticketId);
            setTickets(tickets.filter(t => t.id !== ticketId));
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật!');
        }
    };

    return (
        <div className="tickets-container">
            <div className="tickets-header">
                <h2 className="tickets-title">Yêu Cầu Hỗ Trợ (Đang chờ xử lý)</h2>
            </div>
            
            {loading ? <p>Đang tải dữ liệu...</p> : tickets.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>Hiện không có sự cố nào cần xử lý! 🎉</p>
            ) : (
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>Mã Sự Cố</th>
                            <th>Ngày Gửi</th>
                            <th>Khách Hàng</th>
                            <th>Nội Dung Sự Cố</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id}>
                                <td>#{t.id}</td>
                                <td>{t.date}</td>
                                <td><strong>{t.username}</strong></td>
                                <td>{t.issue}</td>
                                <td>
                                    <button className="btn-resolve" onClick={() => handleResolve(t.id)}>
                                        Đánh dấu Đã Xử Lý
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SupportTickets;