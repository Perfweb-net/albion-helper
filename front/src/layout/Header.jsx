import React, {useContext, useState} from 'react';
import {AppBar, Toolbar, Button, Box, IconButton, Drawer, Divider} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {UserContext} from "../context/UserContext";
import Logo from "../components/svg/Logo";
import {motion} from "framer-motion";
import MenuIcon from '@mui/icons-material/Menu'; // Icône du burger menu
import CloseIcon from '@mui/icons-material/Close'; // Icône de la croix pour fermer le drawer

const Header = () => {
    const navigate = useNavigate();
    const {isLogin, setIsLogin} = useContext(UserContext);

    // Gestion de l'état du menu burger
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Suppression du token
        localStorage.removeItem('refreshToken');
        setIsLogin(false);
        navigate('/login'); // Rediriger vers la page de login
    };

    const toggleDrawer = (open) => {
        setIsDrawerOpen(open);
    };

    const drawerContent = (
            <Box sx={{width: 250, display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
                {/* Icône pour fermer le drawer */}
                <IconButton onClick={() => toggleDrawer(false)} sx={{alignSelf: 'flex-end'}}>
                    <CloseIcon/>
                </IconButton>

                {/* Menu items */}
                {isLogin && (
                    <>
                        <Button color="inherit" component={Link} to="/guilds">Guilds</Button>
                        <Divider/>
                        <Button color="inherit" component={Link} to="/players">Players</Button>
                        <Divider/>
                        <Button color="inherit" component={Link} to="/map">Map</Button>
                        <Divider/>
                    </>
                )}

                {
                    isLogin ? (
                        <Button
                            style={{backgroundColor: "white", color: "black"}}
                            color="primary"
                            variant="contained"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    ) : (
                        <div style={{display: "flex", gap: 10}}>
                            <Button
                                style={{backgroundColor: "white", color: "black"}}
                                color="primary"
                                variant="contained"
                                component={Link}
                                to="/register"
                            >
                                Register
                            </Button>

                            <Button
                                style={{backgroundColor: "#787a7d", color: "white"}}
                                color="secondary"
                                variant="contained"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                        </div>
                    )
                }
            </Box>
        )
    ;

    return (
        <AppBar position="sticky">
            <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
                {/* Logo à gauche */}
                <Box sx={{cursor: "pointer"}} onClick={() => navigate('/dashboard')}>
                    <motion.div
                        initial={{x: 0, rotate: 0}}
                        animate={{x: 0, rotate: 0}}
                        whileHover={{
                            x: [0, -2, 2, -2, 2, 0], // Mouvement de vibration
                            rotate: [0, -2, 2, -2, 2, 0], // Légère rotation
                            transition: {duration: 1, repeat: Infinity}
                        }}
                    >
                        <Logo color={"white"} width={90} height={90}/>
                    </motion.div>
                </Box>

                {/* Menu burger pour les petits écrans */}
                <Box sx={{display: {xs: 'block', sm: 'none'}}}>
                    <IconButton color="inherit" onClick={() => toggleDrawer(true)}>
                        <MenuIcon/>
                    </IconButton>
                </Box>

                {/* Menu central pour les grands écrans */}
                <Box sx={{display: {xs: 'none', sm: 'flex'}, gap: 3, marginRight: 4, justifyContent: "center"}}>
                    {isLogin && (
                        <>
                            <Button color="inherit" component={Link} to="/guilds">Guilds</Button>
                            <Button color="inherit" component={Link} to="/players">Players</Button>
                            <Button color="inherit" component={Link} to="/map">Map</Button>
                        </>
                    )}
                </Box>

                {/* Login / Logout à droite */}
                <Box sx={{display: {xs: 'none', sm: 'flex'}}}>
                    {isLogin ? (
                        <Button
                            style={{backgroundColor: "white", color: "black"}}
                            color="primary"
                            variant="contained"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    ) : (
                        <div style={{display: "flex", gap: 10}}>
                            <Button
                                style={{backgroundColor: "white", color: "black"}}
                                color="primary"
                                variant="contained"
                                component={Link}
                                to="/register"
                            >
                                Register
                            </Button>

                            <Button
                                style={{backgroundColor: "#787a7d", color: "white"}}
                                color="secondary"
                                variant="contained"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                        </div>
                    )}
                </Box>
            </Toolbar>

            {/* Drawer pour mobile */}
            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={() => toggleDrawer(false)}
            >
                {drawerContent}
            </Drawer>
        </AppBar>
    );
};

export default Header;