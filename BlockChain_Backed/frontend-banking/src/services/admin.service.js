// src/services/admin.service.js
import api from './api';

const adminService = {
    getLedger: async () => {
        const response = await api.get('/admin/ledger');
        return response.data;
    },
    
    // 1. GỌI API KIỂM TRA TÍNH MINH BẠCH (SO SÁNH HASH)
    verifyBlockchain: async () => {
        const response = await api.get('/admin/verify-blockchain');
        return response.data;
    },

    // 2. GỌI API GIẢ MẠO DỮ LIỆU CỐ TÌNH LÀM SAI DB
    tamperTransaction: async (txId, tamperedData) => {
        // Lưu ý: Backend của bạn cần có endpoint PUT /api/admin/tamper/{txId} này
        const response = await api.put(`/admin/tamper/${txId}`, tamperedData);
        return response.data;
    },
    getRawDatabaseRecords: async () => {
        // Gọi đến một Endpoint chuyên để đọc thẳng vào bảng SQL
        const response = await api.get('/admin/database-rows');
        return response.data;
    }
};

export default adminService;