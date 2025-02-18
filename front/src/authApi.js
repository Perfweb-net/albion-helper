import axios from 'axios';
import {isTokenValid} from "./components/PrivateRoute";

const api = axios.create({
    baseURL: 'https://albion-back.perfweb.net/api',
    //baseURL: 'http://localhost:8001/api', // Remplacez par l'URL de votre API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajoutez un intercepteur pour ajouter le token dans les headers
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

export default api;
