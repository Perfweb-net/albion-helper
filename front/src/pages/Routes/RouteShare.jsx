import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box, Container, Typography, Card, CardContent, Chip, Alert, CircularProgress, Button
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RouteShare = () => {
    const { token } = useParams();
    const { t } = useTranslation();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gone, setGone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        axios.get(`${baseURL}/routes/share/${token}`)
            .then(res => setRoute(res.data))
            .catch(err => {
                if (err.response?.status === 410) setGone(true);
                else setError(t('common.error'));
            })
            .finally(() => setLoading(false));
    }, [token, t]);

    if (loading) return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <CircularProgress />
        </Container>
    );

    if (gone) return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
                {t('routes.expired')} — ce lien n'est plus valide.
            </Alert>
            <Button component={Link} to="/" startIcon={<HomeIcon />} variant="outlined">
                Retour à l'accueil
            </Button>
        </Container>
    );

    if (error) return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Alert severity="error">{error}</Alert>
        </Container>
    );

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <RouteIcon sx={{ fontSize: 40, color: '#c9a84c' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#c9a84c' }}>
                        {route.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('routes.shared_route')}
                    </Typography>
                </Box>
            </Box>

            <Card sx={{ border: '1px solid rgba(201,168,76,0.3)' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {route.zones?.sort((a, b) => a.position - b.position).map((zone, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: '1px solid rgba(201,168,76,0.15)',
                                    '&:hover': { borderColor: 'rgba(201,168,76,0.4)' }
                                }}
                            >
                                <Typography
                                    sx={{
                                        minWidth: 28,
                                        fontFamily: 'Cinzel, serif',
                                        fontWeight: 700,
                                        color: '#c9a84c',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {idx + 1}
                                </Typography>
                                <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
                                    {zone.zoneName}
                                </Typography>
                                <Chip
                                    icon={<AccessTimeIcon />}
                                    label={`${zone.timerMinutes} min`}
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                />
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button component={Link} to="/register" variant="contained" sx={{ mr: 2 }}>
                    Créer un compte
                </Button>
                <Button component={Link} to="/login" variant="outlined">
                    Se connecter
                </Button>
            </Box>
        </Container>
    );
};

export default RouteShare;
