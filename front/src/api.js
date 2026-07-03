import axios from 'axios';
import { isTokenValid } from './utils/authUtils';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        // Serveur de jeu courant (americas/europe/asia) — lu par le back (X-Albion-Server)
        config.headers['X-Albion-Server'] = localStorage.getItem('albionServer') || 'europe';

        const token = localStorage.getItem('token');
        if (token && !config.url.includes('token/refresh')) {
            await isTokenValid(token);
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers['Authorization'] = `Bearer ${currentToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        // Ne pas rediriger pour les échecs d'authentification eux-mêmes (mauvais identifiants,
        // inscription refusée) : la page doit afficher l'erreur à l'utilisateur.
        const url = error.config?.url || '';
        const isAuthCall = url.includes('/login') || url.includes('/register') || url.includes('token/refresh');
        if (!isAuthCall && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
