// src/layouts/UserLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import './Layout.css';

const UserLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="user-layout">
            {/* Thanh điều hướng bên trái */}
            <aside className="sidebar">
                <div className="sidebar-logo">🏦 MINI BANK</div>
                <ul className="sidebar-menu">
                    <li><Link to="/dashboard" className="sidebar-item">Trang Chủ</Link></li>
                    <li><Link to="/transfer" className="sidebar-item">Chuyển Tiền</Link></li>
                    <li><Link to="/bill-pay" className="sidebar-item">Thanh Toán</Link></li>
                    <li><Link to="/history" className="sidebar-item">Lịch Sử Giao Dịch</Link></li>
                </ul>
                <button onClick={handleLogout} className="logout-btn">Đăng Xuất</button>
            </aside>

            {/* Khung nội dung bên phải */}
            <main className="main-content">
                <header className="main-header">
                    <div className="user-info">Xin chào, {user?.username} (Khách hàng)</div>
                </header>
                <div className="content-body">
                    <Outlet /> {/* Nơi hiển thị các trang con như Dashboard, Transfer... */}
                </div>
            </main>
        </div>
    );
};

export default UserLayout;