// src/services/api.js
import axios from "axios";

const api = axios.create({

    baseURL: 'http://10.10.46.81:8080/api', // Chỉnh lại cho khớp với port Spring Boot của bạn

});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    console.log("TOKEN SENT:", token); // 👈 debug cực mạnh

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;