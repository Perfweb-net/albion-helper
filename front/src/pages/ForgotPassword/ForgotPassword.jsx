import React, {useState} from 'react';
import api from '../../authApi';
import { Link } from 'react-router-dom';
import {Box, Button, Container, TextField, Typography, Card, CardContent, Alert} from "@mui/material";
import LockResetIcon from '@mui/icons-material/LockReset';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/password/forgot', { email });
            setSent(true);
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Trop de demandes. Réessayez dans une heure.');
            } else {
                setError("Une erreur est survenue. Vérifiez l'adresse saisie et réessayez.");
            }
        }
    };

    return (
        <Container maxWidth="sm" className="forgot-password__container">
            <Card className="forgot-password__card">
                <CardContent className="forgot-password__content">
                    <Box className="forgot-password__header">
                        <LockResetIcon className="forgot-password__icon" />
                        <Typography variant="h4" className="forgot-password__title" gutterBottom>
                            Mot de passe oublié
                        </Typography>
                        <Typography variant="body2" className="forgot-password__subtitle">
                            Saisissez l'adresse e-mail associée à votre compte
                        </Typography>
                    </Box>

                    {sent ? (
                        <Alert severity="success" role="status" aria-live="polite" sx={{ mb: 3 }}>
                            Si cette adresse est liée à un compte, un e-mail contenant un lien
                            de réinitialisation (valable 1 heure) vient de lui être envoyé.
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit} aria-labelledby="forgot-password-title">
                            <TextField
                                label="Adresse e-mail"
                                type="email"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="forgot-password__textfield"
                                sx={{ mb: 3 }}
                                autoComplete="email"
                                inputProps={{
                                    'aria-required': 'true',
                                    'aria-label': 'Saisissez votre adresse e-mail'
                                }}
                            />

                            {error && (
                                <Alert
                                    severity="error"
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
                                startIcon={<LockResetIcon />}
                                className="forgot-password__button"
                                sx={{ mb: 3 }}
                                aria-label="Envoyer le lien de réinitialisation"
                            >
                                Envoyer le lien
                            </Button>
                        </form>
                    )}

                    <Box className="forgot-password__link-container">
                        <Typography variant="body2" color="text.secondary">
                            <Link to="/login" className="forgot-password__link">
                                Retour à la connexion
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ForgotPassword;
