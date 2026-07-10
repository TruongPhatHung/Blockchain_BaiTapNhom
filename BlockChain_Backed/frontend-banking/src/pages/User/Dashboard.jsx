// src/pages/User/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // File CSS chúng ta sẽ viết lại ở bước 2

const Dashboard = () => {
    const [showBalance, setShowBalance] = useState(true);
    const [accountInfo, setAccountInfo] = useState({
        accountNumber: '999988888',
        balance: 50000000
    });
    
    // Dữ liệu giả lập (Sau này lấy từ API /api/transactions/history)
    const [recentTx, setRecentTx] = useState([
        { id: 1, type: 'TRANSFER', description: 'Chuyen tien cho me', amount: -2000000, date: '2026-07-09' },
        { id: 2, type: 'DEPOSIT', description: 'Nap tien tu ATM', amount: 10000000, date: '2026-07-08' },
        { id: 3, type: 'BILL_PAYMENT', description: 'Thanh toan tien dien thang 6', amount: -1500000, date: '2026-07-05' }
    ]);

    return (
        // Thêm class này để quản lý phần bao bọc bên ngoài
        <div className="dashboard-container"> 
            <div className="dashboard-grid">
                {/* Khối Thẻ Tài Khoản */}
                <div className="balance-card">
                    <div className="balance-title">Số tài khoản thanh toán: {accountInfo.accountNumber}</div>
                    <div className="balance-amount">
                        {showBalance ? `${accountInfo.balance.toLocaleString()} VNĐ` : '********'}
                        <button className="toggle-blind-btn" onClick={() => setShowBalance(!showBalance)}>
                            {showBalance ? '👁️' : '🕶️'}
                        </button>
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.8 }}>Tài khoản đang hoạt động</div>
                </div>

                {/* Khối Tổng Thu Chi Tháng */}
                <div className="stats-card">
                    <div className="stat-box">
                        <div className="stat-label">Tổng Thu Tháng</div>
                        <div className="stat-value income">+10,000,000 VNĐ</div>
                    </div>
                    {/* Dùng class mới cho đường kẻ dọc */}
                    <div className="stats-divider"></div> 
                    <div className="stat-box">
                        <div className="stat-label">Tổng Chi Tháng</div>
                        <div className="stat-value expense">-3,500,000 VNĐ</div>
                    </div>
                </div>
            </div>

            {/* Bảng Giao Dịch Gần Đây (Giữ nguyên cấu trúc) */}
            <div className="history-section">
                <div className="section-title">Giao dịch gần đây</div>
                <table className="tx-table">
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Nội dung</th>
                            <th>Loại</th>
                            <th>Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTx.map(tx => (
                            <tr key={tx.id}>
                                <td>{tx.date}</td>
                                <td>{tx.description}</td>
                                <td>{tx.type}</td>
                                <td className={`amount-text ${tx.amount > 0 ? 'plus' : 'minus'}`}>
                                    {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} VNĐ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;