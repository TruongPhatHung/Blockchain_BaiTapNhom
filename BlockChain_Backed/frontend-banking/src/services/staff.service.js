// src/services/staff.service.js
import api from './api';

const staffService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },
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
    getSupportTickets: async () => {
        const response = await api.get('/staff/tickets');
        return response.data;
    }
};

// Dòng này cực kỳ quan trọng, phải xuất staffService chứ không phải api
export default staffService;