import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Typography } from '@mui/material';
import ExploreOffIcon from '@mui/icons-material/ExploreOff';
import './NotFound.scss';

// Page 404 : route inconnue dans la SPA
const NotFound = () => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="sm" className="not-found__container">
            <Box className="not-found__content">
                <ExploreOffIcon className="not-found__icon" />
                <Typography variant="h1" className="not-found__code">404</Typography>
                <Typography variant="h5" className="not-found__title" gutterBottom>
                    {t('notfound.title')}
                </Typography>
                <Typography variant="body1" className="not-found__message" sx={{ mb: 4 }}>
                    {t('notfound.message')}
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="primary"
                    size="large"
                    className="not-found__button"
                >
                    {t('notfound.back')}
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;
