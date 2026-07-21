import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import './UserLayout.css'; 

const UserLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Trích xuất chữ cái đầu tiên của Username làm Avatar (Mặc định là 'H' nếu chưa đăng nhập)
    const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'H';

    return (
        <div className="user-layout">
            {/* ---------------- 1. SIDEBAR BÊN TRÁI ---------------- */}
            <aside className="sidebar">
                {/* Logo & Tên Ngân Hàng */}
                <div className="sidebar-logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563eb" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>ABC BANK</span>
                </div>
                
                {/* Danh sách Menu điều hướng */}
                <ul className="sidebar-menu">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <span>Trang Chủ</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/transfer" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            <span>Chuyển Tiền</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/bill-pay" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            <span>Thanh Toán</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/history" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            <span>Lịch Sử Giao Dịch</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Cài đặt</span>
                        </NavLink>
                    </li>
                </ul>

                {/* Nút Đăng xuất ở dưới cùng Sidebar */}
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Đăng Xuất</span>
                    </button>
                </div>
            </aside>

            {/* ---------------- 2. KHUNG NỘI DUNG CHÍNH (MAIN CONTENT) ---------------- */}
            <main className="main-content">
                {/* Navbar / Header Trên Cùng */}
                <header className="main-header">
                    <div className="header-search">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" placeholder="Tìm kiếm tính năng, giao dịch..." />
                    </div>

                    <div className="header-utilities">
                        {/* Biểu tượng chuông thông báo */}
                        <button className="util-icon-btn" title="Thông báo">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span className="badge-dot"></span>
                        </button>
                        
                        {/* Profile người dùng */}
                        <div className="user-profile-wrapper">
                            <div className="user-avatar-circle">{firstLetter}</div>
                            <div className="user-info">
                                <span className="username-text">{user?.username || 'hungsayhi'}</span>
                                <span className="role-text">Thành viên Bạc</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Khu vực hiển thị nội dung các trang con (Dashboard, Transfer, History...) */}
                <div className="content-body">
                    <Outlet />
                </div>

                {/* Footer Mới thêm vào theo thiết kế image_d4c188.png */}
                <footer className="main-footer">
                    <div className="footer-copyright">
                        © 2026 ABC Bank. All rights reserved.
                    </div>
                    <div className="footer-links">
                        <a href="#terms">Điều khoản sử dụng</a>
                        <a href="#guide">Hướng dẫn sử dụng dịch vụ</a>
                        <a href="#tx-guide">Hướng dẫn giao dịch</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default UserLayout;