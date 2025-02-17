import axios from 'axios';
import {isTokenValid} from "./components/PrivateRoute";

const api = axios.create({
    baseURL: 'http://albion-back.perfweb.net:80/api',
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

export default api;
