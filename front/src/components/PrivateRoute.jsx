import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export { isTokenValid } from '../utils/authUtils';

const PrivateRoute = ({ element }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const { isTokenValid } = await import('../utils/authUtils');
                const valid = await isTokenValid(token);
                setIsAuthenticated(valid);
            } else {
                setIsAuthenticated(false);
            }
        };
        checkToken();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;
