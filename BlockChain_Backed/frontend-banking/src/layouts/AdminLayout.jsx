// src/layouts/AdminLayout.jsx
import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
// ĐÃ BỔ SUNG: Nhập các biểu tượng chuyên nghiệp từ lucide-react
import { Building2, Users, Database, BookOpen, ShieldAlert, ClipboardList, LogOut } from 'lucide-react';
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
                <div className="admin-sidebar-logo">
                    <Building2 size={28} color="#3b82f6" /> {/* Icon thay cho 🏦 */}
                    ADMIN PORTAL
                </div>

                <ul className="admin-sidebar-menu">
                    <li>
                        <Link to="/admin/users" className={`admin-sidebar-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`}>
                            <Users size={20} />
                            Quản Lý Khách Hàng
                        </Link>
                    </li>

                    <li>
                        {/* Lưu ý: Giữ lại style chữ đỏ cho trang cảnh báo thao túng DB khi không active */}
                        <Link
                            to="/admin/editor"
                            className={`admin-sidebar-item ${location.pathname.includes('/admin/editor') ? 'active' : ''}`}
                            style={{ color: !location.pathname.includes('/admin/editor') ? '#ef4444' : '#fff' }}
                        >
                            <Database size={20} />
                            Thao Túng DB (Demo)
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/ledger" className={`admin-sidebar-item ${location.pathname.includes('/admin/ledger') ? 'active' : ''}`}>
                            <BookOpen size={20} />
                            Sổ Cái Blockchain
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/verify" className={`admin-sidebar-item ${location.pathname.includes('/admin/verify') ? 'active' : ''}`}>
                            <ShieldAlert size={20} />
                            Đối Soát & Truy Tố
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/audit" className={`admin-sidebar-item ${location.pathname.includes('/admin/audit') ? 'active' : ''}`}>
                            <ClipboardList size={20} />
                            Nhật Ký Hệ Thống
                        </Link>
                    </li>
                </ul>

                {/* Nút đăng xuất đã được đẩy xuống đáy nhờ thuộc tính flex: 1 của danh sách menu */}
                <button onClick={handleLogout} className="admin-logout-btn">
                    <LogOut size={20} />
                    Đăng Xuất
                </button>
            </aside>

            <main className="admin-main-content">
                <header className="admin-main-header">
                    <div className="admin-user-info">
                        Xin chào, <strong>{user?.username || 'Admin'}</strong> (Quản trị viên)
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