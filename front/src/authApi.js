import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001/api', // Remplacez par l'URL de votre API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajoutez un intercepteur pour ajouter le token dans les headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Ou utilisez sessionStorage
        if (token && !config.url.includes('/api/token/refresh')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
