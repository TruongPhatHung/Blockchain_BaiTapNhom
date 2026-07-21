// src/store/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error("Lỗi giải mã JSON từ localStorage:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    // Sửa lại hàm login nhận nguyên object { token, user } từ Backend
    const login = (authData) => {
        const { token, user } = authData;

        setUser(user);
        setToken(token);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        if (token) {
            localStorage.setItem('token', token);
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // --- HÀM MỚI ĐỂ CẬP NHẬT REALTIME TRÊN GIAO DIỆN ---
    const updateUser = (newUserData) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...newUserData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};