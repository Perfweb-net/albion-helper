import React, {useContext, useEffect, useState} from 'react';
import api from '../authApi';
import { useNavigate } from 'react-router-dom';
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import {UserContext} from "../context/UserContext";
import {isTokenValid} from "../components/PrivateRoute";

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

        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('refreshToken', response.data.refresh_token);
            localStorage.setItem('token', response.data.token);

            setIsLogin(true);
            navigate('/dashboard'); // Rediriger vers la page Dashboard après connexion
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion');
            setIsLogin(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 3,
                    boxShadow: 3,
                    borderRadius: 2
                }}
            >
                <Typography variant="h4" gutterBottom>Login</Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        margin="normal"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Login
                    </Button>
                </form>
                {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
            </Box>
        </Container>
    );
};

export default Login;
