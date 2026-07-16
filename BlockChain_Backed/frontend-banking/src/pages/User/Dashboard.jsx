import React, { useState, useContext } from 'react';
import { AuthContext } from "../../store/AuthContext";
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [showBalance, setShowBalance] = useState(true);
    
    const accountInfo = {
        accountNumber: '9876 5432 1098 4567',
        balance: 50000000
    };
    
    // Dữ liệu giả lập
    const recentTx = [
        { id: 1, type: 'TRANSFER', title: 'Chuyển tiền cho mẹ', amount: -2000000, time: 'Hôm nay, 10:42 AM' },
        { id: 2, type: 'DEPOSIT', title: 'Nạp tiền từ ATM', amount: 10000000, time: 'Hôm nay, 08:15 AM' },
        { id: 3, type: 'BILL_PAYMENT', title: 'Thanh toán tiền điện', amount: -1500000, time: 'Hôm qua, 05:00 PM' }
    ];

    // Helper render icon giao dịch
    const renderTxIcon = (type) => {
        switch(type) {
            case 'TRANSFER': return <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
            case 'DEPOSIT': return <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
            case 'BILL_PAYMENT': return <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
            default: return null;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header Lời chào */}
            <div className="dashboard-header">
                <div>
                    <h2>Chào mừng trở lại, {user?.username || 'hungsayhi'}! 👋</h2>
                    <p>Cập nhật tổng quan tài chính của bạn hôm nay.</p>
                </div>
                <div className="date-badge">
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* CỘT TRÁI */}
                <div className="main-column">
                    
                    {/* 1. Thẻ ATM Premium */}
                    <div className="balance-card">
                        <div className="card-overlay"></div>
                        <div className="card-top">
                            <span className="card-label">THẺ GHI NỢ QUỐC TẾ</span>
                            {/* Icon Wifi / Contactless */}
                            <svg className="contactless-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 21.3c-1.8-1.5-3-3.7-3-6.3 0-4.4 3.6-8 8-8s8 3.6 8 8c0 2.6-1.2 4.8-3 6.3"/><path d="M11 21.3c-1-1-1.5-2.3-1.5-3.8 0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.5-.5 2.8-1.5 3.8"/></svg>
                        </div>
                        
                        <div className="card-chip">
                            <svg viewBox="0 0 40 30" fill="none"><rect width="40" height="30" rx="4" fill="#fbbf24"/><path d="M10 0v30M30 0v30M0 10h40M0 20h40" stroke="#d97706" strokeWidth="1"/></svg>
                        </div>

                        <div className="card-number-wrapper">
                            <span className="card-number">{accountInfo.accountNumber}</span>
                        </div>

                        <div className="card-bottom">
                            <div className="balance-info">
                                <span className="card-label">SỐ DƯ HIỆN TẠI</span>
                                <div className="balance-wrapper">
                                    <span className="balance-amount">
                                        {showBalance ? `${accountInfo.balance.toLocaleString('vi-VN')} VNĐ` : '****** VNĐ'}
                                    </span>
                                </div>
                            </div>
                            <button className="toggle-blind-btn" onClick={() => setShowBalance(!showBalance)}>
                                {showBalance ? 
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : 
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                }
                            </button>
                        </div>
                    </div>

                    {/* 2. Nhóm nút thao tác nhanh */}
                    <div className="action-buttons">
                        <button className="action-btn primary">
                            <div className="btn-icon-wrapper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></div>
                            Chuyển tiền
                        </button>
                        <button className="action-btn">
                            <div className="btn-icon-wrapper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg></div>
                            Nạp tiền
                        </button>
                        <button className="action-btn">
                            <div className="btn-icon-wrapper"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                            Thanh toán
                        </button>
                    </div>

                    {/* 3. Thống kê Thu / Chi */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-icon income"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></div>
                            <div className="stat-info">
                                <span className="stat-label">Thu nhập tháng này</span>
                                <span className="stat-value">+10,000,000 đ</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon expense"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></div>
                            <div className="stat-info">
                                <span className="stat-label">Chi tiêu tháng này</span>
                                <span className="stat-value">-3,500,000 đ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="side-column">
                    
                    {/* 1. Danh sách giao dịch */}
                    <div className="recent-tx-card">
                        <div className="tx-header">
                            <h3>Giao dịch gần đây</h3>
                            <a href="/history" className="view-all">Xem tất cả</a>
                        </div>
                        <div className="tx-list">
                            {recentTx.map(tx => (
                                <div className="tx-item" key={tx.id}>
                                    <div className={`tx-icon-wrapper ${tx.amount > 0 ? 'bg-green' : tx.type === 'TRANSFER' ? 'bg-red' : 'bg-yellow'}`}>
                                        {renderTxIcon(tx.type)}
                                    </div>
                                    <div className="tx-details">
                                        <span className="tx-title">{tx.title}</span>
                                        <span className="tx-time">{tx.time}</span>
                                    </div>
                                    <div className={`tx-amount ${tx.amount > 0 ? 'plus' : 'minus'}`}>
                                        {tx.amount > 0 ? `+${tx.amount.toLocaleString('vi-VN')}` : tx.amount.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Banner quảng cáo */}
                    <div className="promo-card">
                        <div className="promo-content">
                            <div className="promo-badge">Premium</div>
                            <h3>Nâng cấp tài khoản</h3>
                            <p>Tận hưởng hạn mức chuyển tiền lên đến 2 tỷ/ngày và miễn phí mọi giao dịch.</p>
                            <button className="promo-btn">Tìm hiểu thêm</button>
                        </div>
                        <svg className="promo-bg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;