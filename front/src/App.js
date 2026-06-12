import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Header from "./layout/Header/Header";
import Footer from "./layout/Footer/Footer";
import Player from "./pages/Player/Player";
import Guild from "./pages/Guild/Guild";
import Map from "./pages/Map/Map";
import Players from "./pages/Players/Players";
import Guilds from "./pages/Guilds/Guilds";
import Items from "./pages/Items/Items";
import Tutorial from "./pages/Tutorial/Tutorial";
import GameRoutes from "./pages/Routes/Routes";
import RouteShare from "./pages/Routes/RouteShare";
import Admin from "./pages/Admin/Admin";
import Craft from "./pages/Craft/Craft";
import CraftDetail from "./pages/Craft/CraftDetail";
import Compositions from "./pages/Compositions/Compositions";
import CompositionEditor from "./pages/Compositions/CompositionEditor";
import CompositionShare from "./pages/Compositions/CompositionShare";

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
            <main style={{ marginBottom: '80px', marginTop: '20px', flex: 1 }}>
                <Routes>
                    {/* Route publique */}
                    <Route path="/" element={<Tutorial/>}/>
                    <Route path="/tutorial" element={<Tutorial/>}/>
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
                        path="/items"
                        element={<PrivateRoute element={<Items/>} isAuthenticated={isAuthenticated}/>}
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
                    <Route
                        path="/routes"
                        element={<PrivateRoute element={<GameRoutes/>} isAuthenticated={isAuthenticated}/>}
                    />
                    <Route path="/routes/share/:token" element={<RouteShare/>}/>
                    <Route path="/compositions/share/:token" element={<CompositionShare/>}/>
                    <Route
                        path="/craft"
                        element={<PrivateRoute element={<Craft/>} isAuthenticated={isAuthenticated}/>}
                    />
                    <Route
                        path="/craft/:id"
                        element={<PrivateRoute element={<CraftDetail/>} isAuthenticated={isAuthenticated}/>}
                    />
                    <Route
                        path="/compositions"
                        element={<PrivateRoute element={<Compositions/>} isAuthenticated={isAuthenticated}/>}
                    />
                    <Route
                        path="/compositions/:id"
                        element={<PrivateRoute element={<CompositionEditor/>} isAuthenticated={isAuthenticated}/>}
                    />
                    <Route
                        path="/admin"
                        element={<PrivateRoute element={<Admin/>} isAuthenticated={isAuthenticated}/>}
                    />
                </Routes>
            </main>

            <Footer/>
        </Router>
    );
};

export default App;
