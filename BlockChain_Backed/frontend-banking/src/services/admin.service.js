// src/services/admin.service.js
import api from './api';

const adminService = {
    // 1. Lấy toàn bộ sổ cái (danh sách các khối trong Blockchain)
    getLedger: async () => {
        const response = await api.get('/admin/ledger');
        return response.data;
    },

    // 2. Kiểm tra tính toàn vẹn của Blockchain (Verify)
    verifyBlockchain: async () => {
        const response = await api.get('/admin/verify');
        return response.data; // Trả về true (hợp lệ) hoặc false (bị sửa đổi)
    }
};

export default adminService;