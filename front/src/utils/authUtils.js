import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const isTokenValid = async (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        const timeLeft = decoded.exp - now;

        if (decoded.exp <= now || timeLeft <= 300) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                localStorage.removeItem('token');
                return false;
            }
            try {
                const response = await axios.post(`${BASE_URL}/token/refresh`, {
                    refresh_token: refreshToken,
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
};
