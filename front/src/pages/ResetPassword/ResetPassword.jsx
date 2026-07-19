import React, {useState} from 'react';
import api from '../../authApi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {Box, Button, Container, TextField, Typography, Card, CardContent, Alert} from "@mui/material";
import LockResetIcon from '@mui/icons-material/LockReset';
import './ResetPassword.scss';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (password !== confirm) {
            setError('Les deux mots de passe ne correspondent pas.');
            return;
        }

        try {
            await api.post('/password/reset', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Le lien de réinitialisation est invalide ou a expiré. Refaites une demande.');
        }
    };

    return (
        <Container maxWidth="sm" className="reset-password__container">
            <Card className="reset-password__card">
                <CardContent className="reset-password__content">
                    <Box className="reset-password__header">
                        <LockResetIcon className="reset-password__icon" />
                        <Typography variant="h4" className="reset-password__title" gutterBottom>
                            Nouveau mot de passe
                        </Typography>
                        <Typography variant="body2" className="reset-password__subtitle">
                            Choisissez un nouveau mot de passe pour votre compte
                        </Typography>
                    </Box>

                    {!token && (
                        <Alert severity="error" role="alert" sx={{ mb: 3 }}>
                            Lien invalide : le jeton de réinitialisation est manquant.
                            Refaites une demande depuis la page{' '}
                            <Link to="/forgot-password" className="reset-password__link">
                                mot de passe oublié
                            </Link>.
                        </Alert>
                    )}

                    {success ? (
                        <Alert severity="success" role="status" aria-live="polite" sx={{ mb: 3 }}>
                            Mot de passe mis à jour ! Redirection vers la connexion…
                        </Alert>
                    ) : token && (
                        <form onSubmit={handleSubmit} aria-labelledby="reset-password-title">
                            <TextField
                                label="Nouveau mot de passe"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="reset-password__textfield"
                                sx={{ mb: 3 }}
                                autoComplete="new-password"
                                inputProps={{
                                    'aria-required': 'true',
                                    'aria-label': 'Saisissez votre nouveau mot de passe'
                                }}
                            />
                            <TextField
                                label="Confirmer le mot de passe"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                className="reset-password__textfield"
                                sx={{ mb: 3 }}
                                autoComplete="new-password"
                                inputProps={{
                                    'aria-required': 'true',
                                    'aria-label': 'Confirmez votre nouveau mot de passe'
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
                                className="reset-password__button"
                                sx={{ mb: 3 }}
                                aria-label="Valider le nouveau mot de passe"
                            >
                                Valider
                            </Button>
                        </form>
                    )}

                    <Box className="reset-password__link-container">
                        <Typography variant="body2" color="text.secondary">
                            <Link to="/login" className="reset-password__link">
                                Retour à la connexion
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ResetPassword;
