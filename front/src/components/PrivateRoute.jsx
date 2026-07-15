import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

// La session vit dans des cookies httpOnly : c'est le contexte utilisateur
// (alimenté par /api/me) qui fait foi, pas un jeton local.
const PrivateRoute = ({ element }) => {
    const { isLogin, sessionLoading } = useContext(UserContext);

    if (sessionLoading) {
        return <div>Loading...</div>;
    }

    return isLogin ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;
