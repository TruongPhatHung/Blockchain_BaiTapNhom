import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // chỉnh lại port backend nếu cần
});

// 🔥 Interceptor: tự động gắn token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // hoặc "accessToken"

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;