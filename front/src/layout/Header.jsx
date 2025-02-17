import React, {useContext, useState} from 'react';
import {AppBar, Toolbar, Button, Box} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {UserContext} from "../context/UserContext";
import Logo from "../components/svg/Logo";
import {motion} from "framer-motion";


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
            <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                {/* Logo à gauche */}
                <Box sx={{cursor: "pointer"}} onClick={() => navigate('/dashboard')}>
                    <motion.div
                        initial={{ x: 0, rotate: 0 }}
                        animate={{ x: 0, rotate: 0 }}
                        whileHover={{
                            x: [0, -2, 2, -2, 2, 0], // Mouvement de vibration
                            rotate: [0, -2, 2, -2, 2, 0], // Légère rotation
                            transition: { duration: 1, repeat: Infinity }
                        }}
                    >
                        <Logo color={"white"} width={90} height={90}/>
                    </motion.div>
                </Box>

                {/* Menu au centre */}
                {isLogin && (
                    <Box sx={{display: 'flex', gap: 3, marginRight: 4, justifyContent: "flex-end"}}>
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
