import React, {useContext, useState} from 'react';
import {AppBar, Toolbar, Typography, Button, Box} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {UserContext} from "../context/UserContext";

const Header = () => {
    // L'état de l'utilisateur connecté
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);
    const navigate = useNavigate();
    const {isLogin, setIsLogin} = useContext(UserContext);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Suppression du token
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false); // Mise à jour de l'état de connexion
        setIsLogin(false);
        navigate('/login'); // Rediriger vers la page de login
    };

    return (
        <AppBar position="sticky">
            <Toolbar>
                {/* Logo à gauche */}
                <Box sx={{flexGrow: 1}}>
                    <Typography variant="h6" component="div">

                    </Typography>
                </Box>

                {/* Menu au centre */}
                {isLogin && (
                    <Box sx={{display: 'flex', gap: 3, marginRight: 4}}>
                        <Button color="inherit" component={Link} to="/dashboard">Home</Button>
                        <Button color="inherit" component={Link} to="/guilds">Guilds</Button>
                        <Button color="inherit" component={Link} to="/players">Players</Button>
                        <Button color="inherit" component={Link} to="/map">Map</Button>
                    </Box>
                )}

                {/* Login / Logout à droite */}
                <Box>
                    {isLogin ? (
                        <Button
                            style={{backgroundColor: "white", color: "black"}} // Couleur bleue pour login
                            color="primary" // Couleur bleue pour login
                            variant="contained" // Style de bouton plein
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    ) : (
                        <div style={{display: "flex", gap: 10}}>
                            <Button
                                style={{backgroundColor: "white", color: "black"}} // Couleur bleue pour login
                                color="primary" // Couleur bleue pour login
                                variant="contained" // Style de bouton plein
                                component={Link}
                                to="/register"
                            >
                                Register
                            </Button>

                            <Button
                                style={{backgroundColor: "#787a7d", color: "white"}} // Couleur bleue pour login
                                color="secondary" // Couleur bleue pour login
                                variant="contained" // Style de bouton plein
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                        </div>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
