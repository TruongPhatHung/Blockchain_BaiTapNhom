// src/pages/User/History.jsx
import React, { useState, useEffect, useContext } from 'react';
import txService from '../../services/tx.service';
import { AuthContext } from '../../store/AuthContext';
import './History.css';

const History = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Gọi API lấy lịch sử theo ID người dùng đang đăng nhập
                const data = await txService.getHistory(user.id);
                setTransactions(data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
                // Tạo dữ liệu giả lập nếu API chưa sẵn sàng để giao diện không bị trống
                setTransactions([
                    { id: 'TX001', date: '2026-07-09', type: 'TRANSFER', description: 'Chuyển tiền mua sắm', amount: -500000 },
                    { id: 'TX002', date: '2026-07-08', type: 'DEPOSIT', description: 'Nạp tiền ATM', amount: 2000000 },
                    { id: 'TX003', date: '2026-07-05', type: 'BILL_PAYMENT', description: 'Thanh toán tiền điện', amount: -450000 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchHistory();
    }, [user]);

    const getBadgeClass = (type) => {
        if (type === 'TRANSFER') return 'type-badge transfer';
        if (type === 'DEPOSIT') return 'type-badge deposit';
        return 'type-badge bill';
    };

    const getTypeLabel = (type) => {
        if (type === 'TRANSFER') return 'Chuyển tiền';
        if (type === 'DEPOSIT') return 'Nạp tiền';
        return 'Hóa đơn';
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h2 className="history-title">Lịch Sử Giao Dịch</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">Không có giao dịch nào gần đây.</div>
            ) : (
                <div className="history-table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Mã GD</th>
                                <th>Thời gian</th>
                                <th>Loại GD</th>
                                <th>Nội dung</th>
                                <th>Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td>#{tx.id}</td>
                                    <td>{tx.date}</td>
                                    <td><span className={getBadgeClass(tx.type)}>{getTypeLabel(tx.type)}</span></td>
                                    <td>{tx.description}</td>
                                    <td className={tx.amount > 0 ? 'amt-positive' : 'amt-negative'}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;