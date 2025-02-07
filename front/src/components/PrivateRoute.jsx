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

        // Vérifier si le token est expiré
        if (expirationTime <= currentTime) {
            return false;
        }

        // Vérifier si le token expire dans moins de 5 minutes (300 secondes)
        const timeLeft = expirationTime - currentTime;
        if (timeLeft <= 300) {  // 5 minutes en secondes
            await api.post('/token/refresh').then((response) => {
                const newToken = response.data.token;
                localStorage.setItem('token', newToken);
            }).catch((error) => {
                console.error('Error refreshing token:', error);
            });
        }

        // Si le token n'est pas expiré et n'expire pas dans les 5 prochaines minutes
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
