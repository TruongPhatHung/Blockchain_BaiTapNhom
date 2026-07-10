// src/services/staff.service.js
import api from './api';

const staffService = {
    // --- 1. Nhóm API Quản lý Người dùng ---
    getAllUsers: async () => {
        const response = await api.get('/staff/users');
        return response.data;
    },

    // --- 2. Nhóm API Tra soát & Hoàn tác (Dùng cho trang Refund.jsx) ---
    getTransactionDetail: async (txId) => {
        const response = await api.get(`/staff/transactions/${txId}`);
        return response.data;
    },

    createRefundOrder: async (txId) => {
        const response = await api.post(`/staff/refund/${txId}`);
        return response.data;
    },

    initiateCompensation: async (txId) => {
        const response = await api.post(`/staff/compensation/${txId}`);
        return response.data;
    },

    // --- 3. Nhóm API Hỗ trợ Sự cố (Dùng cho trang SupportTickets.jsx) ---
    getSupportTickets: async () => {
        const response = await api.get('/staff/tickets');
        return response.data;
    }
};

export default staffService;