import React, { useState } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Grid2, Button, Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import RouteIcon from '@mui/icons-material/Route';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from 'react-i18next';
import './Tutorial.scss';

const TOUR_STEPS = [
    {
        target: '.tutorial__header',
        content: 'Bienvenue sur Albion Helper ! Cet outil vous aide à explorer le monde d\'Albion Online.',
        disableBeacon: true,
        placement: 'bottom',
    },
    {
        target: '.tutorial__cta-box',
        content: 'Créez un compte gratuitement pour accéder à toutes les fonctionnalités.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="feature-players"]',
        content: 'Recherchez n\'importe quel joueur par son pseudo et consultez ses statistiques détaillées.',
        placement: 'top',
    },
    {
        target: '[data-tour="feature-guilds"]',
        content: 'Explorez les guildes et alliances d\'Albion Online.',
        placement: 'top',
    },
    {
        target: '[data-tour="feature-map"]',
        content: 'Cherchez des cartes par nom et consultez les ressources et coffres disponibles.',
        placement: 'top',
    },
    {
        target: '[data-tour="feature-routes"]',
        content: 'Créez des routes de farming reliant jusqu\'à 8 zones et partagez-les avec un lien public.',
        placement: 'top',
    },
    {
        target: '.tutorial__steps-paper',
        content: 'Suivez ces 3 étapes simples pour démarrer votre aventure !',
        placement: 'top',
    },
];

const Tutorial = () => {
    const { t } = useTranslation();
    const [runTour, setRunTour] = useState(false);

    const handleTourCallback = ({ status }) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
        }
    };

    return (
        <Container maxWidth="lg" className="tutorial__container">
            <Joyride
                steps={TOUR_STEPS}
                run={runTour}
                continuous
                showProgress
                showSkipButton
                scrollOffset={80}
                disableScrollParentFix
                callback={handleTourCallback}
                styles={{
                    options: {
                        primaryColor: '#c9a84c',
                        backgroundColor: '#1e1a10',
                        textColor: '#f5edd8',
                        arrowColor: '#1e1a10',
                        overlayColor: 'rgba(0,0,0,0.7)',
                        zIndex: 9999,
                    },
                    tooltip: {
                        backgroundColor: '#1e1a10',
                        borderRadius: 6,
                        border: '1px solid rgba(201,168,76,0.5)',
                        color: '#f5edd8',
                        fontSize: 15,
                        padding: '16px 20px',
                    },
                    tooltipTitle: {
                        color: '#c9a84c',
                        fontFamily: 'Cinzel, serif',
                        fontSize: 16,
                        fontWeight: 700,
                    },
                    tooltipContent: {
                        color: '#f5edd8',
                        padding: '8px 0 0 0',
                    },
                    tooltipFooter: {
                        marginTop: 12,
                    },
                    buttonNext: {
                        backgroundColor: '#c9a84c',
                        color: '#0a0805',
                        fontFamily: 'Cinzel, serif',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                    },
                    buttonBack: {
                        color: '#c9a84c',
                        fontWeight: 600,
                        marginRight: 8,
                    },
                    buttonSkip: {
                        color: '#aaa',
                    },
                    buttonClose: {
                        color: '#aaa',
                    },
                    spotlight: {
                        borderRadius: 4,
                    },
                }}
                locale={{
                    back: t('tutorial.back'),
                    close: t('common.close'),
                    last: t('tutorial.finish'),
                    next: t('tutorial.next'),
                    skip: t('tutorial.skip'),
                }}
            />

            <Box className="tutorial__header">
                <InfoIcon className="tutorial__icon" />
                <Typography variant="h3" className="tutorial__title" gutterBottom>
                    {t('tutorial.title')}
                </Typography>
                <Typography variant="body1" className="tutorial__subtitle">
                    {t('tutorial.subtitle')}
                </Typography>
            </Box>

            <Card className="tutorial__info-card">
                <CardContent className="tutorial__info-content">
                    <Typography variant="h5" className="tutorial__section-title" gutterBottom>
                        Avant de commencer
                    </Typography>
                    <Typography variant="body1" className="tutorial__text" paragraph>
                        Pour utiliser toutes les fonctionnalités d'Albion Helper, vous devez d'abord créer un compte.
                        C'est gratuit et ne prend que quelques secondes !
                    </Typography>
                    <Box className="tutorial__cta-box">
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/register"
                            size="large"
                            startIcon={<PersonAddIcon />}
                            endIcon={<ArrowForwardIcon />}
                            className="tutorial__cta-button"
                        >
                            Créer un compte
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<PlayCircleOutlineIcon />}
                            onClick={() => setRunTour(true)}
                            className="tutorial__tour-button"
                        >
                            {t('tutorial.start_tour')}
                        </Button>
                        <Typography variant="body2" className="tutorial__cta-text">
                            Déjà un compte ? <Link to="/login" className="tutorial__link">Connectez-vous</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h4" className="tutorial__features-title" gutterBottom>
                Fonctionnalités
            </Typography>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }} data-tour="feature-players">
                    <Card className="tutorial__feature-card">
                        <CardContent className="tutorial__feature-content">
                            <Box className="tutorial__feature-header">
                                <PersonIcon className="tutorial__feature-icon" />
                                <Typography variant="h6" className="tutorial__feature-title">
                                    Recherche de joueurs
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="tutorial__feature-description">
                                Recherchez des joueurs par leur pseudo et consultez leurs statistiques détaillées :
                                Kill Fame, Death Fame, PvE, Gathering, Crafting et bien plus encore.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }} data-tour="feature-guilds">
                    <Card className="tutorial__feature-card">
                        <CardContent className="tutorial__feature-content">
                            <Box className="tutorial__feature-header">
                                <GroupsIcon className="tutorial__feature-icon" />
                                <Typography variant="h6" className="tutorial__feature-title">
                                    Recherche de guildes
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="tutorial__feature-description">
                                Explorez les guildes d'Albion Online, consultez leurs statistiques, leurs membres
                                et leurs performances en PvP.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }} data-tour="feature-map">
                    <Card className="tutorial__feature-card">
                        <CardContent className="tutorial__feature-content">
                            <Box className="tutorial__feature-header">
                                <MapIcon className="tutorial__feature-icon" />
                                <Typography variant="h6" className="tutorial__feature-title">
                                    Exploration de cartes
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="tutorial__feature-description">
                                Recherchez et explorez les cartes d'Albion Online. Découvrez les coffres disponibles,
                                les ressources à récolter et les tunnels pour planifier vos aventures.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }} data-tour="feature-routes">
                    <Card className="tutorial__feature-card">
                        <CardContent className="tutorial__feature-content">
                            <Box className="tutorial__feature-header">
                                <RouteIcon className="tutorial__feature-icon" />
                                <Typography variant="h6" className="tutorial__feature-title">
                                    Routes de farming
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="tutorial__feature-description">
                                Créez des routes reliant jusqu'à 8 zones avec un minuteur par zone.
                                Partagez votre route via un lien public valable 24h.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Card className="tutorial__feature-card">
                        <CardContent className="tutorial__feature-content">
                            <Box className="tutorial__feature-header">
                                <InventoryIcon className="tutorial__feature-icon" />
                                <Typography variant="h6" className="tutorial__feature-title">
                                    Recherche d'items
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="tutorial__feature-description">
                                Recherchez des items par nom, tier et qualité. Consultez les prix du marché
                                pour optimiser vos transactions.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>

            <Paper className="tutorial__steps-paper">
                <Typography variant="h5" className="tutorial__steps-title" gutterBottom>
                    Comment commencer ?
                </Typography>
                <Box className="tutorial__steps-list">
                    <Box className="tutorial__step">
                        <Box className="tutorial__step-number">1</Box>
                        <Box className="tutorial__step-content">
                            <Typography variant="h6" className="tutorial__step-title">
                                Créez votre compte
                            </Typography>
                            <Typography variant="body2" className="tutorial__step-description">
                                Inscrivez-vous gratuitement pour accéder à toutes les fonctionnalités
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="tutorial__step">
                        <Box className="tutorial__step-number">2</Box>
                        <Box className="tutorial__step-content">
                            <Typography variant="h6" className="tutorial__step-title">
                                Explorez le Dashboard
                            </Typography>
                            <Typography variant="body2" className="tutorial__step-description">
                                Utilisez la barre de recherche pour trouver des joueurs, guildes ou cartes
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="tutorial__step">
                        <Box className="tutorial__step-number">3</Box>
                        <Box className="tutorial__step-content">
                            <Typography variant="h6" className="tutorial__step-title">
                                Consultez les détails
                            </Typography>
                            <Typography variant="body2" className="tutorial__step-description">
                                Cliquez sur un résultat pour voir toutes les informations détaillées
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Box className="tutorial__footer-cta">
                <Typography variant="h6" className="tutorial__footer-title">
                    Prêt à commencer ?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/register"
                        size="large"
                        startIcon={<PersonAddIcon />}
                        className="tutorial__footer-button"
                    >
                        Créer mon compte maintenant
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayCircleOutlineIcon />}
                        onClick={() => setRunTour(true)}
                    >
                        {t('tutorial.start_tour')}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Tutorial;
