import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRateLimited } from '../hooks/useRateLimited';

/**
 * Avertit l'utilisateur quand le quota de requêtes (50/min, cf. back:
 * ApiRateLimitSubscriber) est dépassé — monté une seule fois, en haut de l'app.
 */
export default function RateLimitToast() {
    const { t } = useTranslation();
    const rateLimited = useRateLimited();

    return (
        <Snackbar
            open={rateLimited}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
                {t('common.rate_limited')}
            </Alert>
        </Snackbar>
    );
}
