// src/layouts/AdminLayout.jsx
import { useContext } from 'react'; // 👈 Đã bỏ import React thừa để hết gạch đỏ
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

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">🏦 ADMIN PORTAL</div>
                <ul className="admin-sidebar-menu">
                    <li>
                        <Link to="/admin/users" className={`admin-sidebar-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`}>
                            👤 Quản Lý Khách Hàng
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/editor" className={`admin-sidebar-item ${location.pathname.includes('/admin/editor') ? 'active' : ''}`} style={{ color: '#ef4444' }}>
                            ⚠️ Thao Túng DB (Demo)
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/ledger" className={`admin-sidebar-item ${location.pathname.includes('/admin/ledger') ? 'active' : ''}`}>
                            📜 Sổ Cái Blockchain
                        </Link>
                    </li>

                    {/* 🟢 ĐÃ BỔ SUNG: Trang Đối soát & Truy tố dữ liệu bị sửa */}
                    <li>
                        <Link to="/admin/verify" className={`admin-sidebar-item ${location.pathname.includes('/admin/verify') ? 'active' : ''}`}>
                            🛡️ Đối Soát & Truy Tố
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/audit" className={`admin-sidebar-item ${location.pathname.includes('/admin/audit') ? 'active' : ''}`}>
                            📋 Nhật Ký Hệ Thống
                        </Link>
                    </li>
                </ul>
                <button onClick={handleLogout} className="admin-logout-btn">Đăng Xuất</button>
            </aside>

            <main className="admin-main-content">
                <header className="admin-main-header">
                    <div className="admin-user-info">
                        Xin chào, <strong>{user?.username}</strong> (Quản trị viên)
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