import axios from 'axios';
import {isTokenValid} from "./components/PrivateRoute";

const api = axios.create({
    baseURL: 'https://albion-back.perfweb.net/api',
    //baseURL: 'http://localhost:8001/api', //
    contentType: 'application/json',
});

api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token'); // Ou utilisez sessionStorage

        if (token) {
            if (!config.url.includes('token/refresh')) {
                const isValid = isTokenValid(token).then((response) => {
                    token = localStorage.getItem('token');
                    return response;
                });

                if (isValid) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Déconnexion : suppression des tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            // Redirige vers la page de login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
