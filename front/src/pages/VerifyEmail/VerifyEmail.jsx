import React, {useEffect, useRef, useState} from 'react';
import api from '../../authApi';
import { Link, useSearchParams } from 'react-router-dom';
import {Box, Container, Typography, Card, CardContent, Alert, CircularProgress} from "@mui/material";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import './VerifyEmail.scss';

const VerifyEmail = () => {
    const [status, setStatus] = useState('pending'); // pending | success | error
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const requested = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }
        // Garde contre le double appel du StrictMode : le jeton est à usage unique
        if (requested.current) return;
        requested.current = true;

        api.post('/email/verify', { token })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [token]);

    return (
        <Container maxWidth="sm" className="verify-email__container">
            <Card className="verify-email__card">
                <CardContent className="verify-email__content">
                    <Box className="verify-email__header">
                        <MarkEmailReadIcon className="verify-email__icon" />
                        <Typography variant="h4" className="verify-email__title" gutterBottom>
                            Confirmation d'adresse
                        </Typography>
                    </Box>

                    {status === 'pending' && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CircularProgress aria-label="Vérification en cours" />
                        </Box>
                    )}

                    {status === 'success' && (
                        <Alert severity="success" role="status" aria-live="polite" sx={{ mb: 3 }}>
                            Votre adresse e-mail est confirmée : la récupération de compte
                            (mot de passe oublié) est maintenant active.
                        </Alert>
                    )}

                    {status === 'error' && (
                        <Alert severity="error" role="alert" sx={{ mb: 3 }}>
                            Lien de confirmation invalide ou déjà utilisé. Si votre adresse
                            n'est pas encore confirmée, réinscrivez-vous ou contactez le support.
                        </Alert>
                    )}

                    <Box className="verify-email__link-container">
                        <Typography variant="body2" color="text.secondary">
                            <Link to="/login" className="verify-email__link">
                                Aller à la connexion
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default VerifyEmail;
