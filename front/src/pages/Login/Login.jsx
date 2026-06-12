import React, {useContext, useEffect, useState} from 'react';
import api from '../../authApi';
import { useNavigate, Link } from 'react-router-dom';
import {Box, Button, Container, TextField, Typography, Card, CardContent, Alert} from "@mui/material";
import {UserContext} from "../../context/UserContext";
import {isTokenValid} from "../../components/PrivateRoute";
import LoginIcon from '@mui/icons-material/Login';
import './Login.scss';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {isLogin, setIsLogin} = useContext(UserContext);

    useEffect(() => {
        const isValid = isTokenValid(localStorage.getItem('token'));
        if (isLogin && isValid) {
            navigate('/dashboard');
        }
    }, [navigate, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('refreshToken', response.data.refresh_token);
            localStorage.setItem('token', response.data.token);

            setIsLogin(true);
            navigate('/dashboard');
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion. Vérifiez vos identifiants.');
            setIsLogin(false);
        }
    };

    return (
        <Container maxWidth="sm" className="login__container">
            <Card className="login__card">
                <CardContent className="login__content">
                    <Box className="login__header">
                        <LoginIcon className="login__icon" />
                        <Typography variant="h4" className="login__title" gutterBottom>
                            Connexion
                        </Typography>
                        <Typography variant="body2" className="login__subtitle">
                            Connectez-vous à votre compte
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit} aria-labelledby="login-title">
                        <TextField
                            label="Nom d'utilisateur"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="login__textfield"
                            autoComplete="username"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-label': "Saisissez votre nom d'utilisateur"
                            }}
                        />
                        <TextField
                            label="Mot de passe"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login__textfield"
                            autoComplete="current-password"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-label': "Saisissez votre mot de passe"
                            }}
                        />
                        
                        {error && (
                            <Alert 
                                severity="error" 
                                className="login__alert" 
                                role="alert"
                                aria-live="assertive"
                            >
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            startIcon={<LoginIcon />}
                            className="login__button"
                            aria-label="Se connecter à mon compte"
                        >
                            Se connecter
                        </Button>

                        <Box className="login__link-container">
                            <Typography variant="body2" color="text.secondary">
                                Pas encore de compte ?{' '}
                                <Link to="/register" className="login__link">
                                    S'inscrire
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
