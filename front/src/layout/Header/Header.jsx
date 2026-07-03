import React, { useContext, useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Button, Box, IconButton, Drawer, Divider,
    Typography, Tooltip, Menu, MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useServer } from '../../context/ServerContext';
import { langFlag } from '../../utils/langFlags';
import Logo from '../../components/svg/Logo';
import { useTranslation } from 'react-i18next';
import { availableLanguages, fetchAvailableLanguages } from '../../i18n';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import RouteIcon from '@mui/icons-material/Route';
import ConstructionIcon from '@mui/icons-material/Construction';
import GroupsIcon from '@mui/icons-material/Groups';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PublicIcon from '@mui/icons-material/Public';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import './Header.scss';

const Header = () => {
    const navigate = useNavigate();
    const { isLogin, setIsLogin, user } = useContext(UserContext);
    const { mode, toggleTheme } = useThemeMode();
    const { server, setServer, current, servers } = useServer();
    const { t, i18n } = useTranslation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [langMenuAnchor, setLangMenuAnchor] = useState(null);
    const [serverMenuAnchor, setServerMenuAnchor] = useState(null);
    const [languages, setLanguages] = useState(availableLanguages);

    useEffect(() => {
        fetchAvailableLanguages().then(setLanguages);
    }, []);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsLogin(false);
        navigate('/login');
    };

    const handleLangChange = (code) => {
        i18n.changeLanguage(code);
        setLangMenuAnchor(null);
    };

    const navLinks = isLogin ? [
        { to: '/guilds', label: t('nav.guilds') },
        { to: '/players', label: t('nav.players') },
        { to: '/map', label: t('nav.map') },
        { to: '/routes', label: t('nav.routes'), icon: <RouteIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        { to: '/items', label: t('nav.items') },
        { to: '/craft', label: t('nav.craft'), icon: <ConstructionIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        { to: '/compositions', label: t('nav.compositions'), icon: <GroupsIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
        { to: '/battles', label: t('nav.battles'), icon: <MilitaryTechIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
    ] : [];

    const drawerContent = (
        <Box className="header__drawer-content">
            <Box className="header__drawer-header">
                <Typography variant="h6" className="header__drawer-title">Menu</Typography>
                <IconButton onClick={() => setIsDrawerOpen(false)} aria-label={t('common.close')}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider />

            {navLinks.map((link) => (
                <Button
                    key={link.to}
                    color="inherit"
                    component={Link}
                    to={link.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className="header__drawer-button"
                    startIcon={link.icon}
                >
                    {link.label}
                </Button>
            ))}

            {isAdmin && (
                <Button
                    color="inherit"
                    component={Link}
                    to="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="header__drawer-button"
                    startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />}
                >
                    {t('nav.admin')}
                </Button>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ px: 1.5, display: 'flex', gap: 1, mb: 1 }}>
                <Tooltip title={t('theme.toggle')}>
                    <IconButton onClick={toggleTheme} size="small">
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Langue / Language">
                    <IconButton size="small" onClick={(e) => setLangMenuAnchor(e.currentTarget)}>
                        <TranslateIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            <Box className="header__drawer-auth">
                {isLogin ? (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLogout}
                        fullWidth
                        startIcon={<LogoutIcon />}
                    >
                        {t('nav.logout')}
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button variant="contained" component={Link} to="/register" fullWidth startIcon={<PersonAddIcon />}>
                            {t('nav.register')}
                        </Button>
                        <Button variant="outlined" component={Link} to="/login" fullWidth startIcon={<LoginIcon />}>
                            {t('nav.login')}
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <AppBar position="sticky" elevation={0} className="header__appbar">
            <Toolbar className="header__toolbar">
                {/* Logo */}
                <Box
                    component={Link}
                    to={isLogin ? '/dashboard' : '/'}
                    sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}
                    aria-label="Albion Helper — Accueil"
                >
                    <Logo color="#c9a84c" width={48} height={48} />
                    <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.08em', color: '#c9a84c', display: { xs: 'none', sm: 'block' } }}>
                        Albion Helper
                    </Typography>
                </Box>

                {/* Mobile burger */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={t('theme.toggle')}>
                        <IconButton size="small" onClick={toggleTheme}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        color="inherit"
                        onClick={() => setIsDrawerOpen(true)}
                        aria-label="Ouvrir le menu de navigation"
                        aria-expanded={isDrawerOpen}
                        aria-controls="navigation-drawer"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>

                {/* Desktop nav */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, ml: 3, flex: 1 }}>
                    {navLinks.map((link) => (
                        <Button
                            key={link.to}
                            color="inherit"
                            component={Link}
                            to={link.to}
                            className="header__menu-button"
                            startIcon={link.icon}
                            sx={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: 'rgba(232,220,200,0.85)', '&:hover': { color: '#c9a84c' } }}
                        >
                            {link.label}
                        </Button>
                    ))}
                    {isAdmin && (
                        <Button
                            color="inherit"
                            component={Link}
                            to="/admin"
                            startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: '#c9a84c', '&:hover': { color: '#e8c96b' } }}
                        >
                            {t('nav.admin')}
                        </Button>
                    )}
                </Box>

                {/* Desktop right: theme + lang + auth */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <Tooltip title={t('theme.toggle')}>
                        <IconButton size="small" onClick={toggleTheme}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Serveur de jeu">
                        <Button size="small" onClick={(e) => setServerMenuAnchor(e.currentTarget)}
                            startIcon={<PublicIcon sx={{ fontSize: 18 }} />}
                            sx={{ color: 'rgba(201,168,76,0.9)', fontSize: '0.72rem', letterSpacing: '0.05em', minWidth: 0 }}>
                            {current.label}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Langue / Language">
                        <IconButton size="small" onClick={(e) => setLangMenuAnchor(e.currentTarget)}>
                            <TranslateIcon />
                        </IconButton>
                    </Tooltip>

                    {isLogin ? (
                        <Button variant="outlined" size="small" onClick={handleLogout} startIcon={<LogoutIcon />}
                            sx={{ borderColor: 'rgba(201,168,76,0.4)', color: 'rgba(201,168,76,0.9)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                            {t('nav.logout')}
                        </Button>
                    ) : (
                        <>
                            <Button variant="outlined" component={Link} to="/login" size="small" startIcon={<LoginIcon />}
                                sx={{ borderColor: 'rgba(201,168,76,0.4)', color: 'rgba(201,168,76,0.9)', fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                                {t('nav.login')}
                            </Button>
                            <Button variant="contained" component={Link} to="/register" size="small" startIcon={<PersonAddIcon />}
                                sx={{ fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                                {t('nav.register')}
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>

            {/* Server menu */}
            <Menu anchorEl={serverMenuAnchor} open={Boolean(serverMenuAnchor)} onClose={() => setServerMenuAnchor(null)}>
                {servers.map((s) => (
                    <MenuItem
                        key={s.key}
                        onClick={() => { setServer(s.key); setServerMenuAnchor(null); }}
                        selected={server === s.key}
                    >
                        <Box component="span" sx={{ mr: 1 }}>{s.flag}</Box>
                        {s.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Language menu */}
            <Menu anchorEl={langMenuAnchor} open={Boolean(langMenuAnchor)} onClose={() => setLangMenuAnchor(null)}>
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        selected={i18n.language === lang.code}
                    >
                        <Box component="span" sx={{ mr: 1, fontSize: '1.1rem', lineHeight: 1 }}>{langFlag(lang.code)}</Box>
                        {lang.label}
                    </MenuItem>
                ))}
            </Menu>

            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                id="navigation-drawer"
                aria-label="Menu de navigation principal"
                PaperProps={{ sx: { width: 280 } }}
            >
                {drawerContent}
            </Drawer>
        </AppBar>
    );
};

export default Header;
