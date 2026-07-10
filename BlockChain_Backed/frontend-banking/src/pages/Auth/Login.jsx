// src/pages/Auth/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import { AuthContext } from '../../store/AuthContext';
import './Auth.css'; // File CSS chúng ta sẽ viết lại ở bước 2

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await authService.login(username, password);
            login(data);
            
            if (data.role === 'ADMIN') navigate('/admin/ledger');
            else if (data.role === 'STAFF') navigate('/staff/users');
            else navigate('/dashboard');
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError('Sai tên đăng nhập hoặc mật khẩu!');
        }
    };

    return (
        // Lớp bọc ngoài cùng (tràn màn hình)
        <div className="auth-container">
            {/* Lớp bọc form đăng nhập màu trắng */}
            <div className="auth-box">
                <h2 className="auth-title">MINI BANKING</h2>
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleLogin} className="auth-form">
                    <input 
                        type="text" 
                        className="auth-input"
                        placeholder="Tên đăng nhập" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        className="auth-input"
                        placeholder="Mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="auth-button">Đăng Nhập</button>
                </form>
            </div>
        </div>
    );
};

export default Login;