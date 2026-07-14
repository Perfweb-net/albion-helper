import React, { useState, useMemo } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Grid2, Button, Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import RouteIcon from '@mui/icons-material/Route';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../context/ThemeContext';
import './Tutorial.scss';

const FEATURES = [
    { key: 'players', icon: PersonIcon, tour: 'feature-players' },
    { key: 'guilds', icon: GroupsIcon, tour: 'feature-guilds' },
    { key: 'map', icon: MapIcon, tour: 'feature-map' },
    { key: 'routes', icon: RouteIcon, tour: 'feature-routes' },
    { key: 'items', icon: InventoryIcon, tour: null },
];

const Tutorial = () => {
    const { t } = useTranslation();
    const { mode } = useThemeMode();
    const [runTour, setRunTour] = useState(false);
    const isDark = mode === 'dark';

    const tourSteps = useMemo(() => [
        { target: '.tutorial__header', content: t('tutorial.tour_welcome'), placement: 'bottom' },
        { target: '.tutorial__cta-box', content: t('tutorial.tour_cta'), placement: 'bottom' },
        { target: '[data-tour="feature-players"]', content: t('tutorial.tour_players'), placement: 'top' },
        { target: '[data-tour="feature-guilds"]', content: t('tutorial.tour_guilds'), placement: 'top' },
        { target: '[data-tour="feature-map"]', content: t('tutorial.tour_map'), placement: 'top' },
        { target: '[data-tour="feature-routes"]', content: t('tutorial.tour_routes'), placement: 'top' },
        { target: '.tutorial__steps-paper', content: t('tutorial.tour_steps'), placement: 'top' },
    // Affiche directement l'infobulle de chaque étape (react-joyride v3 : skipBeacon).
    ].map((step) => ({ skipBeacon: true, ...step })), [t]);

    const handleTourCallback = ({ status }) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
        }
    };

    const tooltipBg = isDark ? '#1e1a10' : '#fdf7ec';
    const tooltipText = isDark ? '#f5edd8' : '#1a1005';
    const gold = isDark ? '#c9a84c' : '#8b6914';

    return (
        <Container maxWidth="lg" className="tutorial__container">
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous
                showProgress
                showSkipButton
                scrollOffset={120}
                spotlightPadding={8}
                callback={handleTourCallback}
                floaterProps={{ styles: { floater: { maxWidth: 440 } } }}
                styles={{
                    options: {
                        primaryColor: gold,
                        backgroundColor: tooltipBg,
                        textColor: tooltipText,
                        arrowColor: tooltipBg,
                        overlayColor: 'rgba(0,0,0,0.7)',
                        zIndex: 9999,
                    },
                    tooltip: {
                        backgroundColor: tooltipBg,
                        borderRadius: 6,
                        border: `1px solid ${isDark ? 'rgba(201,168,76,0.5)' : 'rgba(139,105,20,0.5)'}`,
                        color: tooltipText,
                        fontSize: 15,
                        padding: '16px 20px',
                        maxWidth: 440,
                        width: 'auto',
                    },
                    tooltipTitle: {
                        color: gold,
                        fontFamily: 'Cinzel, serif',
                        fontSize: 16,
                        fontWeight: 700,
                    },
                    tooltipContent: {
                        color: tooltipText,
                        padding: '8px 0 0 0',
                    },
                    tooltipFooter: {
                        marginTop: 12,
                    },
                    buttonNext: {
                        backgroundColor: gold,
                        color: isDark ? '#0a0805' : '#fff',
                        fontFamily: 'Cinzel, serif',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 16px',
                    },
                    buttonBack: {
                        color: gold,
                        fontWeight: 600,
                        marginRight: 8,
                    },
                    buttonSkip: {
                        color: isDark ? '#aaa' : '#777',
                    },
                    buttonClose: {
                        color: isDark ? '#aaa' : '#777',
                    },
                    spotlight: {
                        borderRadius: 8,
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
                        {t('tutorial.before_title')}
                    </Typography>
                    <Typography variant="body1" className="tutorial__text" paragraph>
                        {t('tutorial.before_text')}
                    </Typography>
                    <Box className="tutorial__cta-box">
                        <Box className="tutorial__cta-buttons">
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
                                {t('tutorial.create_account')}
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
                        </Box>
                        <Typography variant="body2" className="tutorial__cta-text">
                            {t('tutorial.already_account')}{' '}
                            <Link to="/login" className="tutorial__link">{t('tutorial.login_link')}</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h4" className="tutorial__features-title" gutterBottom>
                {t('tutorial.features_title')}
            </Typography>

            <Grid2 container spacing={3}>
                {FEATURES.map(({ key, icon: Icon, tour }) => (
                    <Grid2 size={{ xs: 12, md: 6 }} key={key} {...(tour ? { 'data-tour': tour } : {})}>
                        <Card className="tutorial__feature-card">
                            <CardContent className="tutorial__feature-content">
                                <Box className="tutorial__feature-header">
                                    <Icon className="tutorial__feature-icon" />
                                    <Typography variant="h6" className="tutorial__feature-title">
                                        {t(`tutorial.feature_${key}_title`)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" className="tutorial__feature-description">
                                    {t(`tutorial.feature_${key}_desc`)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>

            <Paper className="tutorial__steps-paper">
                <Typography variant="h5" className="tutorial__steps-title" gutterBottom>
                    {t('tutorial.steps_title')}
                </Typography>
                <Box className="tutorial__steps-list">
                    {[1, 2, 3].map((n) => (
                        <Box className="tutorial__step" key={n}>
                            <Box className="tutorial__step-number">{n}</Box>
                            <Box className="tutorial__step-content">
                                <Typography variant="h6" className="tutorial__step-title">
                                    {t(`tutorial.step${n}_title`)}
                                </Typography>
                                <Typography variant="body2" className="tutorial__step-description">
                                    {t(`tutorial.step${n}_desc`)}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>

            <Box className="tutorial__footer-cta">
                <Typography variant="h6" className="tutorial__footer-title">
                    {t('tutorial.ready_title')}
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
                        {t('tutorial.ready_button')}
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
