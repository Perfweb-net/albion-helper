import React, { useState } from 'react';
import api from '../../authApi';
import { useNavigate, Link } from 'react-router-dom';
import {Box, Button, Container, TextField, Typography, Card, CardContent, Alert} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import './Register.scss';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/register', { username, password, email });
            // Le compte doit être activé via le lien reçu par e-mail avant la connexion
            setRegistered(true);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
        }
    };

    if (registered) {
        return (
            <Container maxWidth="sm" className="register__container">
                <Card className="register__card">
                    <CardContent className="register__content">
                        <Box className="register__header">
                            <PersonAddIcon className="register__icon" />
                            <Typography variant="h4" className="register__title" gutterBottom>
                                Vérifiez votre boîte mail
                            </Typography>
                        </Box>
                        <Alert severity="success" role="status" aria-live="polite" sx={{ mb: 3 }}>
                            Votre compte est créé ! Un e-mail de confirmation a été envoyé à{' '}
                            <strong>{email}</strong> : cliquez sur le lien qu'il contient pour
                            activer votre compte, puis connectez-vous.
                        </Alert>
                        <Box className="register__link-container">
                            <Typography variant="body2" color="text.secondary">
                                <Link to="/login" className="register__link">
                                    Aller à la connexion
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" className="register__container">
            <Card className="register__card">
                <CardContent className="register__content">
                    <Box className="register__header">
                        <PersonAddIcon className="register__icon" />
                        <Typography variant="h4" className="register__title" gutterBottom>
                            Inscription
                        </Typography>
                        <Typography variant="body2" className="register__subtitle">
                            Créez votre compte pour commencer
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit} aria-labelledby="register-title">
                        <TextField
                            label="Nom d'utilisateur"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="register__textfield"
                            sx={{ mb: 3 }}
                            autoComplete="username"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-label': "Choisissez un nom d'utilisateur"
                            }}
                        />
                        <TextField
                            label="Adresse e-mail"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="register__textfield"
                            sx={{ mb: 3 }}
                            autoComplete="email"
                            helperText="Un lien de confirmation vous sera envoyé pour activer le compte"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-label': 'Saisissez votre adresse e-mail'
                            }}
                        />
                        <TextField
                            label="Mot de passe"
                            variant="outlined"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="register__textfield"
                            sx={{ mb: 3 }}
                            autoComplete="new-password"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-label': "Choisissez un mot de passe sécurisé"
                            }}
                        />

                        {error && (
                            <Alert
                                severity="error"
                                className="register__alert"
                                sx={{ mb: 3 }}
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
                            startIcon={<PersonAddIcon />}
                            className="register__button"
                            sx={{ mb: 3 }}
                            aria-label="Créer mon compte"
                        >
                            S'inscrire
                        </Button>

                        <Box className="register__link-container">
                            <Typography variant="body2" color="text.secondary">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="register__link">
                                    Se connecter
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Register;
