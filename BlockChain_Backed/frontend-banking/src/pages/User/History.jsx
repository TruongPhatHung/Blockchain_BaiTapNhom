// src/pages/User/History.jsx
import React, { useState, useEffect, useContext } from 'react';
import { 
    ArrowDownToLine, 
    ArrowUpRight, 
    Zap, 
    Calendar,
    Search
} from 'lucide-react';
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
                // Gọi API thực tế
                // const data = await txService.getHistory(user.id);
                // setTransactions(data);
                
                // Mock data tạm thời phong phú hơn để test UI
                setTimeout(() => {
                    setTransactions([
                        { id: 'TX001', date: '12 Th10, 08:30', type: 'DEPOSIT', title: 'Nhận lương tháng 9', counterparty: 'TechCorp Inc.', amount: 25000000, status: 'Thành công' },
                        { id: 'TX002', date: '11 Th10, 19:45', type: 'TRANSFER', title: 'Chuyển tiền mua sắm', counterparty: 'Golden Lotus', amount: -1250000, status: '' },
                        { id: 'TX003', date: '10 Th10, 14:20', type: 'BILL_PAYMENT', title: 'Thanh toán tiền điện', counterparty: 'EVN Hà Nội', amount: -850000, status: '' },
                        { id: 'TX004', date: '08 Th10, 09:15', type: 'TRANSFER', title: 'Chuyển khoản từ Nguyễn Văn A', counterparty: 'Hoàn trả tiền cf', amount: 55000, status: '' },
                    ]);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
                setLoading(false);
            }
        };

        if (user?.id) fetchHistory();
    }, [user]);

    // Hàm chọn Icon và Màu sắc dựa trên loại giao dịch
    const getTxDetails = (type, amount) => {
        if (type === 'DEPOSIT' || (type === 'TRANSFER' && amount > 0)) {
            return { icon: ArrowDownToLine, colorClass: 'icon-deposit' };
        }
        if (type === 'BILL_PAYMENT') {
            return { icon: Zap, colorClass: 'icon-bill' };
        }
        return { icon: ArrowUpRight, colorClass: 'icon-transfer' }; // Mặc định cho chuyển đi
    };

    return (
        <div className="history-wrapper">
            <div className="history-container">
                {/* Header */}
                <div className="history-header">
                    <div>
                        <h2 className="history-title">Lịch sử giao dịch</h2>
                        <p className="history-subtitle">Quản lý và theo dõi các hoạt động tài chính của bạn.</p>
                    </div>
                </div>

                {/* Bộ lọc (Filters) - Chỉ là UI mô phỏng để giống thiết kế */}
                <div className="filter-section">
                    <div className="filter-group">
                        <span className="filter-label">Thời gian</span>
                        <div className="filter-buttons">
                            <button className="btn-filter active">Tháng này</button>
                            <button className="btn-filter">Tuần này</button>
                            <button className="btn-filter with-icon">Tùy chọn <Calendar size={14}/></button>
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">Loại giao dịch</span>
                        <div className="filter-buttons outline">
                            <button className="btn-filter outline active">Tất cả</button>
                            <button className="btn-filter outline">Tiền vào</button>
                            <button className="btn-filter outline">Tiền ra</button>
                        </div>
                    </div>
                </div>

                {/* Danh sách giao dịch */}
                <div className="transaction-list-container">
                    <div className="list-header">
                        <span className="month-title">Tháng 10, 2023</span>
                        <span className="month-total">Tổng: +12,450,000 VND</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">Đang tải dữ liệu...</div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state">Không có giao dịch nào gần đây.</div>
                    ) : (
                        <div className="transaction-list">
                            {transactions.map((tx) => {
                                const { icon: TxIcon, colorClass } = getTxDetails(tx.type, tx.amount);
                                const isPositive = tx.amount > 0;

                                return (
                                    <div className="tx-item" key={tx.id}>
                                        <div className="tx-item-left">
                                            <div className={`tx-icon-wrapper ${colorClass}`}>
                                                <TxIcon size={20} />
                                            </div>
                                            <div className="tx-info">
                                                <div className="tx-name">{tx.title}</div>
                                                <div className="tx-meta">
                                                    {tx.date} • {tx.counterparty}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tx-item-right">
                                            <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
                                                {isPositive ? '+' : ''}{tx.amount.toLocaleString()} VND
                                            </div>
                                            {tx.status && <div className="tx-status">{tx.status}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {!loading && transactions.length > 0 && (
                        <button className="btn-load-more">Tải thêm giao dịch...</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;