import React from 'react';
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
import Battles from "./pages/Battles/Battles";

const App = () => {
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
                        element={<PrivateRoute element={<Dashboard/>}/>}
                    />

                    <Route
                        path="/player/:playerId"
                        element={<PrivateRoute element={<Player/>}/>}
                    />

                    <Route
                        path="/map"
                        element={<PrivateRoute element={<Map/>}/>}
                    />

                    <Route
                        path="/items"
                        element={<PrivateRoute element={<Items/>}/>}
                    />

                    <Route
                        path="/players"
                        element={<PrivateRoute element={<Players/>}/>}
                    />


                    <Route path="/guilds" element={<PrivateRoute element={<Guilds/>}/>}/>
                    <Route
                        path="/guild/:guildId"
                        element={<PrivateRoute element={<Guild/>}/>}
                    />
                    <Route
                        path="/routes"
                        element={<PrivateRoute element={<GameRoutes/>}/>}
                    />
                    <Route path="/routes/share/:token" element={<RouteShare/>}/>
                    <Route path="/compositions/share/:token" element={<CompositionShare/>}/>
                    <Route
                        path="/craft"
                        element={<PrivateRoute element={<Craft/>}/>}
                    />
                    <Route
                        path="/craft/:id"
                        element={<PrivateRoute element={<CraftDetail/>}/>}
                    />
                    <Route
                        path="/compositions"
                        element={<PrivateRoute element={<Compositions/>}/>}
                    />
                    <Route
                        path="/compositions/:id"
                        element={<PrivateRoute element={<CompositionEditor/>}/>}
                    />
                    <Route
                        path="/battles"
                        element={<PrivateRoute element={<Battles/>}/>}
                    />
                    <Route
                        path="/admin"
                        element={<PrivateRoute element={<Admin/>}/>}
                    />
                </Routes>
            </main>

            <Footer/>
        </Router>
    );
};

export default App;
