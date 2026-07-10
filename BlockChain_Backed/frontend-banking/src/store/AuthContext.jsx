// src/store/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy dữ liệu từ Local Storage
        const storedUser = localStorage.getItem('user');
        
        // KIỂM TRA AN TOÀN: Chỉ parse khi có dữ liệu và dữ liệu KHÔNG PHẢI là chữ "undefined"
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Lỗi giải mã JSON từ localStorage:", error);
                // Nếu dữ liệu bị hỏng, xóa nó đi để tránh lỗi ở lần sau
                localStorage.removeItem('user'); 
            }
        }
    }, []);

    // Hàm gọi khi đăng nhập thành công
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Hàm gọi khi đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Xóa cả token nếu bạn có lưu
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};