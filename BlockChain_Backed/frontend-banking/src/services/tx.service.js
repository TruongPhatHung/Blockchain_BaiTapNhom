// src/services/tx.service.js
import api from './api';

const txService = {
    // 1. Chuyển tiền
    transfer: async (transferData) => {
        const response = await api.post('/transactions/transfer', transferData);
        return response.data;
    },
    
    // 2. Xem lịch sử (Truyền vào ID của User)
    getHistory: async (userId) => {
        const response = await api.get(`/transactions/history/${userId}`);
        return response.data;
    },

    // 3. Thanh toán hóa đơn
    payBill: async (billData) => {
        // billData gồm: { billType, billCode, amount }
        const response = await api.post('/transactions/pay-bill', billData);
        return response.data;
    }
};

export default txService;