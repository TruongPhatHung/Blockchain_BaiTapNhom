// src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import '../pages/Auth/Auth.css'; // Import file CSS tách riêng

const AuthLayout = () => {
    return (
        <div className="auth-container">
            <div className="auth-card">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;