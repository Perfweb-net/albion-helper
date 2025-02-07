import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    contentType: 'application/json',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Ou utilisez sessionStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
