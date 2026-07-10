// src/routes/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    // Nếu chưa đăng nhập -> Đá về trang login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu quyền của user không nằm trong danh sách được phép -> Về login hoặc trang báo lỗi
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;