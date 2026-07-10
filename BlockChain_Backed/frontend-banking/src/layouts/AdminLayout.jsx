// src/layouts/AdminLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import './AdminLayout.css'; // Gọi đúng file CSS của riêng nó

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isStaff = user?.role === 'STAFF';

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">🏦 {isStaff ? 'STAFF PORTAL' : 'ADMIN PORTAL'}</div>
                <ul className="admin-sidebar-menu">
                    {isStaff ? (
                        <>
                            <li>
                                <Link to="/staff/users" className={`admin-sidebar-item ${location.pathname.includes('/staff/users') ? 'active' : ''}`}>
                                    Quản Lý Khách Hàng
                                </Link>
                            </li>
                            <li>
                                <Link to="/staff/refund" className={`admin-sidebar-item ${location.pathname.includes('/staff/refund') ? 'active' : ''}`}>
                                    Tra Soát & Hoàn Tác
                                </Link>
                            </li>
                            <li>
                                <Link to="/staff/tickets" className={`admin-sidebar-item ${location.pathname.includes('/staff/tickets') ? 'active' : ''}`}>
                                    Hỗ Trợ & Sự Cố
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/admin/ledger" className="admin-sidebar-item">Sổ Cái Blockchain</Link></li>
                            <li><Link to="/admin/audit" className="admin-sidebar-item">Nhật Ký Hệ Thống</Link></li>
                        </>
                    )}
                </ul>
                <button onClick={handleLogout} className="admin-logout-btn">Đăng Xuất</button>
            </aside>

            <main className="admin-main-content">
                <header className="admin-main-header">
                    <div className="admin-user-info">
                        Xin chào, {user?.username} ({isStaff ? 'Nhân viên' : 'Quản trị viên'})
                    </div>
                </header>
                <div className="admin-content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;