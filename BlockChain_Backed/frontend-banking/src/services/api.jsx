import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Chỉnh lại cho khớp với port Spring Boot của bạn
});

// Tự động nhét JWT Token vào Header của mọi request gửi đi
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;