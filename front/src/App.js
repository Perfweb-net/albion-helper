import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './Dashboard';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    // Vérifie si l'utilisateur est authentifié
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Vérifie si un token JWT existe dans le localStorage
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    return (
        <Router>
            <Routes>
                {/* Route publique */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Route protégée */}
                <Route
                    path="/dashboard"
                    element={<PrivateRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />}
                />
            </Routes>
        </Router>
    );
};

export default App;
