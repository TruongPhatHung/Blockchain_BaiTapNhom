// src/services/staff.service.js
import api from './api'; // Import đối tượng api đã cấu hình sẵn baseURL và Token

const staffService = {
    // ĐÃ SỬA: Xóa bỏ '/api' ở đầu đường dẫn. 
    // Khi gọi, Axios sẽ tự động ghép thành 'http://localhost:8080/api/users'
    getUsers: async () => {
        const response = await api.get('/users'); 
        return response.data;
    },

    // Bạn cũng nên áp dụng tương tự cho các hàm khác (nếu có)
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    }
};

export default staffService;