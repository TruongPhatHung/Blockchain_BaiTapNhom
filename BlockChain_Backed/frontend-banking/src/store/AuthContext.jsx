// src/store/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// 1. THÊM EXPORT: Xuất Context để các component khác có thể dùng useContext gọi tới
export const AuthContext = createContext();

// 2. THÊM EXPORT: Xuất Provider để bọc toàn bộ ứng dụng trong main.jsx
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // State giúp trì hoãn việc render giao diện cho đến khi đọc xong dữ liệu từ LocalStorage
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Lấy dữ liệu người dùng và token từ Local Storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        // KIỂM TRA AN TOÀN: Chỉ parse khi có dữ liệu và dữ liệu KHÔNG PHẢI là chữ "undefined"
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error("Lỗi giải mã JSON từ localStorage:", error);
                // Nếu dữ liệu bị hỏng, xóa sạch để tránh lỗi ở lần tải trang sau
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        // Hoàn tất quá trình tải dữ liệu
        setIsLoading(false);
    }, []);

    // Hàm gọi khi đăng nhập thành công (Lưu cả user và token từ Spring Boot trả về)
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);

        localStorage.setItem('user', JSON.stringify(userData));
        if (authToken) {
            localStorage.setItem('token', authToken);
        }
    };

    // Hàm gọi khi người dùng bấm Đăng xuất
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Biến phụ trợ để kiểm tra nhanh xem người dùng đã đăng nhập chưa
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {/* Chỉ hiển thị giao diện khi đã đọc xong dữ liệu, tránh màn hình bị nháy */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};