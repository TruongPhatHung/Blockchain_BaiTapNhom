// src/services/admin.service.js
import api from './api';

const adminService = {
    // --- DÀNH CHO TRANG SỔ CÁI ---
    getLedger: async () => {
        const response = await api.get('/admin/ledger');
        return response.data;
    },
    
    // --- DÀNH CHO TRANG ĐỐI SOÁT & TRUY TỐ ---
    verifyBlockchain: async () => {
        const response = await api.get('/admin/verify-blockchain');
        return response.data;
    },

    restoreTransaction: async (txId) => {
        const response = await api.post(`/admin/restore/${txId}`);
        return response.data;
    },

    // --- DÀNH CHO TRANG THAO TÚNG DB ---
    getRawDatabaseRecords: async () => {
        const response = await api.get('/admin/database-rows');
        return response.data;
    },

    // Đã dọn dẹp: Chỉ giữ lại đúng 1 hàm tamperTransaction
    tamperTransaction: async (txId, tamperedData) => {
        const response = await api.put(`/admin/tamper/${txId}`, tamperedData);
        return response.data;
    },

    // --- ĐÃ BỔ SUNG: DÀNH CHO TRANG NHẬT KÝ HỆ THỐNG ---
    getAuditLogs: async () => {
        const response = await api.get('/admin/audit-logs');
        return response.data;
    }
};

export default adminService;