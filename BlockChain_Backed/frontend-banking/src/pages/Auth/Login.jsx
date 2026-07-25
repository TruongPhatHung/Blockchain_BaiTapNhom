// src/pages/Auth/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Lock, 
    Eye, 
    EyeOff, 
    Building2, 
    ShieldCheck, 
    CreditCard, 
    Users 
} from 'lucide-react';
import authService from '../../services/auth.service';
import { AuthContext } from '../../store/AuthContext';
import './Auth.css'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await authService.login(username, password);
            login(data);

            const userRole = data.user?.role ? data.user.role.toUpperCase() : '';
            if (userRole.includes('ADMIN')) {
                navigate('/admin/ledger');
            } else if (userRole.includes('STAFF')) {
                navigate('/staff/users');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError('Sai tên đăng nhập hoặc mật khẩu!');
        }
    };

    return (
        <div className="auth-split-container">
            {/* ================= CỘT BÊN TRÁI: BRANDING & MKT ================= */}
            <div className="auth-left">
                {/* Header Logo */}
                <div className="auth-left-header">
                    <div className="brand-icon-box">
                        <Building2 size={24} color="#ffffff" />
                    </div>
                    <div>
                        <h3 className="brand-name">ABC Bank</h3>
                        <p className="brand-tagline">Next-Gen Digital Banking</p>
                    </div>
                </div>

                {/* Tiêu đề & Khẩu hiệu Marketing */}
                <div className="auth-left-body">
                    <h1 className="marketing-title">
                        Mọi giao dịch tài chính đều <span className="highlight-text">an toàn</span> và <span className="highlight-text">tốc độ</span>.
                    </h1>
                    <p className="marketing-subtitle">
                        — Nền tảng ngân hàng số tin cậy. Bảo mật tuyệt đối. Quản lý thông minh.
                    </p>

                    {/* Danh sách 3 Thẻ tính năng (Feature Cards) */}
                    <div className="feature-cards-list">
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <ShieldCheck size={22} className="icon-gold" />
                            </div>
                            <div className="feature-info">
                                <h4>Bảo mật 24/7</h4>
                                <p>Mã hóa chuẩn ngân hàng quốc tế</p>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <CreditCard size={22} className="icon-cyan" />
                            </div>
                            <div className="feature-info">
                                <h4>Chuyển tiền siêu tốc</h4>
                                <p>Giao dịch tức thì không phí ẩn</p>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Users size={22} className="icon-green" />
                            </div>
                            <div className="feature-info">
                                <h4>+2,000,000 Khách hàng</h4>
                                <p>Tin dùng và đồng hành cùng ABC Bank</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer phía dưới cột trái */}
                <div className="auth-left-footer">
                    <ShieldCheck size={16} /> Được bảo vệ bởi Hệ thống An ninh Ngân hàng Nhà nước
                </div>
            </div>

            {/* ================= CỘT BÊN PHẢI: FORM ĐĂNG NHẬP ================= */}
            <div className="auth-right">
                <div className="auth-form-wrapper">
                    {/* Header Chào Mừng */}
                    <div className="form-header-text">
                       
                        <h2 className="auth-heading">Đăng nhập vào ABC Bank</h2>
                        <p className="auth-subheading">Tiếp tục hành trình trải nghiệm dịch vụ ngân hàng của bạn</p>
                    </div>

                    {/* Báo lỗi nếu có */}
                    {error && <div className="auth-error">{error}</div>}

                    {/* Form Đăng Nhập */}
                    <form onSubmit={handleLogin} className="auth-form">
                        
                        {/* Input Username */}
                        <div className="auth-input-group">
                            <User className="auth-input-icon-left" size={20} />
                            <input 
                                type="text" 
                                className="auth-input-modern"
                                placeholder="Tên đăng nhập" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Input Password (Có nút ẩn/hiện con mắt) */}
                        <div className="auth-input-group">
                            <Lock className="auth-input-icon-left" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="auth-input-modern"
                                placeholder="Mật khẩu" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Nút Submit */}
                        <button type="submit" className="auth-btn-primary">
                            Đăng nhập
                        </button>
                    </form>

                    {/* Điều khoản dưới form */}
                    <div className="auth-footer-disclaimer">
                        Bằng cách đăng nhập, bạn đồng ý với <a href="#terms">Điều khoản sử dụng</a> và <a href="#privacy">Chính sách bảo mật</a> của ABC Bank.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;