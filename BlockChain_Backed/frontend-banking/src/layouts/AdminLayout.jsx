// src/layouts/AdminLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ĐÃ XÓA: biến isStaff vì giờ đây tất cả đều là ADMIN

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                {/* Đổi tên cổng thông tin */}
                <div className="admin-sidebar-logo">🏦 ADMIN PORTAL</div>
                <ul className="admin-sidebar-menu">
                    {/* Gộp toàn bộ 5 tính năng vào 1 menu duy nhất */}
                    <li>
                        <Link to="/admin/users" className={`admin-sidebar-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`}>
                            Quản Lý Khách Hàng
                        </Link>
                    </li>
                   
                    <li>
                        <Link to="/admin/editor" className={`admin-sidebar-item ${location.pathname.includes('/admin/editor') ? 'active' : ''}`} style={{ color: '#ef4444' }}>
                            ⚠️ Thao Túng DB (Demo)
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/ledger" className={`admin-sidebar-item ${location.pathname.includes('/admin/ledger') ? 'active' : ''}`}>
                            Sổ Cái Blockchain
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/audit" className={`admin-sidebar-item ${location.pathname.includes('/admin/audit') ? 'active' : ''}`}>
                            Nhật Ký Hệ Thống
                        </Link>
                    </li>
                </ul>
                <button onClick={handleLogout} className="admin-logout-btn">Đăng Xuất</button>
            </aside>

            <main className="admin-main-content">
                <header className="admin-main-header">
                    <div className="admin-user-info">
                        {/* Cập nhật lại lời chào chỉ dành cho Quản trị viên */}
                        Xin chào, {user?.username} (Quản trị viên)
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