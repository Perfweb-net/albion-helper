import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import './OfflineOverlay.scss';

// Superposition plein écran affichée quand le navigateur perd la connexion
// (événements online/offline) — disparaît d'elle-même au retour du réseau.
const OfflineOverlay = () => {
    const { t } = useTranslation();
    const [offline, setOffline] = useState(
        typeof navigator !== 'undefined' && navigator.onLine === false
    );

    useEffect(() => {
        const goOffline = () => setOffline(true);
        const goOnline = () => setOffline(false);
        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
        };
    }, []);

    if (!offline) return null;

    return (
        <Box className="offline-overlay" role="alert" aria-live="assertive">
            <Box className="offline-overlay__content">
                <WifiOffIcon className="offline-overlay__icon" />
                <Typography variant="h4" className="offline-overlay__title" gutterBottom>
                    {t('offline.title')}
                </Typography>
                <Typography variant="body1" className="offline-overlay__message" sx={{ mb: 4 }}>
                    {t('offline.message')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => window.location.reload()}
                >
                    {t('offline.retry')}
                </Button>
            </Box>
        </Box>
    );
};

export default OfflineOverlay;
