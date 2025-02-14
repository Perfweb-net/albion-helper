import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from "../authApi";

export const isTokenValid = async (token) => {
    if (!token) return false;

    try {
        // Décoder le token
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // En secondes
        const expirationTime = decodedToken.exp; // Temps d'expiration du token
        const timeLeft = expirationTime - currentTime;

        // Vérifier si le token est expiré
        if (expirationTime <= currentTime || timeLeft <= 300) {  // 5 minutes en secondes
            await api.post('/token/refresh',{refresh_token: localStorage.getItem('refreshToken')}).then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
            }).catch((error) => {
                console.error('Error refreshing token:', error);
            });
        }

        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        return false;
    }
};

// Composant pour protéger les routes
const PrivateRoute = ({ element }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // State for auth status

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const valid = await isTokenValid(token);
                setIsAuthenticated(valid);
            } else {
                setIsAuthenticated(false); // If there's no token, set as unauthenticated
            }
        };

        checkToken(); // Check authentication status when component mounts
    }, []); // Empty dependency array to run only once on mount

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Optionally show a loading spinner or similar
    }

    return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;
