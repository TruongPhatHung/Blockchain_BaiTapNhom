// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Auth/Login';
import UserLayout from '../layouts/UserLayout';
import Dashboard from '../pages/User/Dashboard';
import Transfer from '../pages/User/Transfer';
import History from '../pages/User/History';
import BillPay from '../pages/User/BillPay';
import AdminLayout from '../layouts/AdminLayout';
import ManageUsers from '../pages/Admin/ManageUsers';
import SupportTickets from '../pages/Admin/SupportTickets';
import TransferConfirm from '../pages/User/TransferConfirm';

import Settings from '../pages/User/Settings'; // Import trang Settings cho User
import EditProfile from '../pages/User/EditProfile'; // Import trang EditProfile cho User

// --- IMPORT CHO ADMIN ---
import LedgerExplorer from '../pages/Admin/LedgerExplorer';
import VerifyBlockchain from '../pages/Admin/VerifyBlockchain';

import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* LUỒNG USER (Khách Hàng) */}
            <Route path="/" element={<PrivateRoute allowedRoles={['USER']}><UserLayout /></PrivateRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transfer" element={<Transfer />} />
                <Route path="history" element={<History />} />
                <Route path="bill-pay" element={<BillPay />} />
                <Route path="settings" element={<Settings />} /> {/* Thêm đường dẫn cho trang Settings */}
                <Route path="settings/edit-profile" element={<EditProfile />} /> {/* Thêm đường dẫn cho trang EditProfile */}
                <Route path="tickets" element={<SupportTickets />} />
                <Route path="/transfer-confirm" element={<TransferConfirm />} />
            </Route>

           
               
                
            

            {/* LUỒNG ADMIN (Quản Trị Viên) */}
            <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminLayout /></PrivateRoute>}>
                <Route path="ledger" element={<LedgerExplorer />} />
                <Route path="audit" element={<VerifyBlockchain />} /> {/* Thay Audit bằng Verify cho khớp menu */}
                 <Route path="tickets" element={<SupportTickets />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;