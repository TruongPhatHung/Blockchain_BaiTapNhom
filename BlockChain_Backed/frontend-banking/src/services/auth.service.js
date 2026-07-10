import api from './api'; // Import cấu hình axios chúng ta đã tạo

const authService = {
    // Hàm gọi API Đăng nhập
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data; // Trả về dữ liệu (gồm thông tin user và token)
    },
    
    // Hàm gọi API Đăng ký (chuẩn bị sẵn cho bước sau)
    register: async (userData) => {
        const response = await api.post('/accounts/register', userData);
        return response.data;
    }
};

export default authService;