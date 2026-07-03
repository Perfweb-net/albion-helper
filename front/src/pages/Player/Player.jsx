import React, {useState, useEffect} from 'react';
import api from '../../api';
import {useNavigate, useParams} from 'react-router-dom';
import {Avatar, Box, Button, Card, CardContent, Divider, Grid2, Typography, Container, Chip, Paper} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {isTokenValid} from "../../components/PrivateRoute";
import PlayerPvP from './PlayerPvP';
import { useTranslation } from 'react-i18next';
import './Player.scss';

const Player = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
    const [player, setPlayer] = useState('');
    const [error, setError] = useState('');
    const playerId = useParams().playerId;
    const navigate = useNavigate();  // Initialisation du hook pour la navigation

    useEffect(() =>{
        const getPlayerInfo = async (e) => {
            const token = localStorage.getItem('token');

            await isTokenValid(token);

            await api.get("/player/" + playerId).then(
                (response) => {
                    if (response.data.statut !== "OK") {
                        setError(response.data.message);
                    } else {
                        setPlayer(response.data.player);
                        setError('');
                    }
                }
            ).catch((error) => console.error('Error fetching player:', error));
        }

        getPlayerInfo();
    }, [playerId]);

    const handleGoBack = () => {
        navigate('/players');  // Remplace "/dashboard" par le chemin du tableau de bord
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon/>}
                sx={{ mb: 3 }}
            >
                {t('common.back')}
            </Button>
            
            {player && (
                <Grid2 container spacing={3}>
                    {/* Carte principale - Profil */}
                    <Grid2 size={12}>
                        <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                                    <Avatar 
                                        src={player.Avatar || "/default-avatar.png"} 
                                        alt={player.Name}
                                        sx={{width: 100, height: 100}}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                            {player.Name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {t('player.id_label')}: {player.Id}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {player.GuildName && (
                                                <Chip
                                                    label={`${t('player.guild')}: ${player.GuildName}`}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            {player.AllianceName && (
                                                <Chip
                                                    label={`${t('player.alliance')}: ${player.AllianceName}`}
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Statistiques PVP */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <EmojiEventsIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        {t('player.stats_pvp')}
                                    </Typography>
                                </Box>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'success.light', color: 'white' }}>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('player.kill_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700}>
                                                {player.KillFame.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'error.light', color: 'white' }}>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('player.death_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700}>
                                                {player.DeathFame.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <Paper sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>{t('player.kill_ratio')}</Typography>
                                            <Typography variant="h6" fontWeight={700}>
                                                {player.DeathFame > 0 ? Math.round(player.KillFame / player.DeathFame * 100) / 100 : '—'}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Statistiques FAME */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <TrendingUpIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        {t('player.stats_fame')}
                                    </Typography>
                                </Box>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('player.pve_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {player.LifetimeStatistics.PvE.Total.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('player.gathering_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {player.LifetimeStatistics.Gathering.All.Total.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('player.crafting_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {player.LifetimeStatistics.Crafting.Total.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('player.fishing_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {player.LifetimeStatistics.FishingFame.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Détails PvE */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {t('player.pve_details')}
                                </Typography>
                                <Grid2 container spacing={2}>
                                    {Object.entries(player.LifetimeStatistics.PvE).map(([key, value]) => (
                                        <Grid2 size={6} key={key}>
                                            <Box sx={{ p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {key}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {value.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid2>
                                    ))}
                                </Grid2>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Détails Gathering */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {t('player.gathering_details')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {Object.entries(player.LifetimeStatistics.Gathering).map(([resource, stats]) => (
                                        <Paper key={resource} sx={{ p: 2, backgroundColor: 'background.default' }}>
                                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                {resource}
                                            </Typography>
                                            <Grid2 container spacing={1}>
                                                {Object.entries(stats).map(([key, value]) => (
                                                    <Grid2 size={6} key={key}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {key}:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {value.toLocaleString()}
                                                        </Typography>
                                                    </Grid2>
                                                ))}
                                            </Grid2>
                                        </Paper>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid2>
                </Grid2>
            )}

            {player && player.Id && <PlayerPvP playerId={player.Id} />}

            {error && (
                <Card sx={{ mt: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <CardContent>
                        <Typography color="error" variant="h6">
                            {error || t('player.error_loading')}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
};

export default Player;  // Le nom du composant doit aussi être en majuscule ici