// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT LAYOUT VÀ AUTH ---
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Auth/Login';
import PrivateRoute from './PrivateRoute';

// --- IMPORT CHO USER ---
import UserLayout from '../layouts/UserLayout';
import Dashboard from '../pages/User/Dashboard';
import Transfer from '../pages/User/Transfer';
import History from '../pages/User/History';
import BillPay from '../pages/User/BillPay';
import Settings from '../pages/User/Settings';
import EditProfile from '../pages/User/EditProfile';
import TransferConfirm from '../pages/User/TransferConfirm';

// --- IMPORT CHO ADMIN ---
import AdminLayout from '../layouts/AdminLayout';
import ManageUsers from '../pages/Admin/ManageUsers';
import SupportTickets from '../pages/Admin/SupportTickets';
import LedgerExplorer from '../pages/Admin/LedgerExplorer';
import VerifyBlockchain from '../pages/Admin/VerifyBlockchain';
import AuditLogs from '../pages/Admin/AuditLogs'; // Import thêm trang Nhật ký
import DatabaseEditor from '../pages/Admin/DatabaseEditor'; // Import thêm trang Database Editor

const AppRoutes = () => {
    return (
        <Routes>
            {/* LUỒNG XÁC THỰC (Chưa đăng nhập) */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* LUỒNG USER (Khách Hàng) */}
            <Route path="/" element={<PrivateRoute allowedRoles={['USER']}><UserLayout /></PrivateRoute>}>
                {/* Sử dụng đường dẫn tương đối (không có dấu / ở đầu) */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transfer" element={<Transfer />} />
                <Route path="transfer-confirm" element={<TransferConfirm />} />
                <Route path="history" element={<History />} />
                <Route path="bill-pay" element={<BillPay />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/edit-profile" element={<EditProfile />} />
                <Route path="tickets" element={<SupportTickets />} />
            </Route>

            {/* LUỒNG ADMIN (Quản Trị Viên) */}
            <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminLayout /></PrivateRoute>}>
                {/* Đồng bộ chính xác 5 trang với thanh menu AdminLayout */}
                <Route path="users" element={<ManageUsers />} />
                <Route path="tickets" element={<SupportTickets />} />
                <Route path="ledger" element={<LedgerExplorer />} />
                <Route path="verify" element={<VerifyBlockchain />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="editor" element={<DatabaseEditor />} />
            </Route>

            {/* ĐƯỜNG DẪN DỰ PHÒNG (Bắt các URL không tồn tại) */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;