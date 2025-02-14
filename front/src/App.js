import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Player from "./pages/Player";
import Guild from "./pages/Guild";
import Map from "./pages/Map";
import Players from "./pages/Players";
import Guilds from "./pages/Guilds";

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
            <Header/>
            <main style={{ marginBottom: '100px' , marginTop: '50px' }}>
                <Routes>
                    {/* Route publique */}
                    <Route path="/" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>

                    {/* Route protégée */}
                    <Route
                        path="/dashboard"
                        element={<PrivateRoute element={<Dashboard/>} isAuthenticated={isAuthenticated}/>}
                    />

                    <Route
                        path="/player/:playerId"
                        element={<PrivateRoute element={<Player/>} isAuthenticated={isAuthenticated}/>}
                    />

                    <Route
                        path="/map"
                        element={<PrivateRoute element={<Map/>} isAuthenticated={isAuthenticated}/>}
                    />

                    <Route
                        path="/players"
                        element={<PrivateRoute element={<Players/>} isAuthenticated={isAuthenticated}/>}
                    />


                    <Route path="/guilds" element={<PrivateRoute element={<Guilds/>} isAuthenticated={isAuthenticated}/>}/>
                    <Route
                        path="/guild/:guildId"
                        element={<PrivateRoute element={<Guild/>} isAuthenticated={isAuthenticated}/>}
                    />
                </Routes>
            </main>

            <Footer/>
        </Router>
    );
};

export default App;
