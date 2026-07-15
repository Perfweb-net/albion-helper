import React, {useState, useEffect} from 'react';
import api from '../../api';
import {useNavigate, useParams} from 'react-router-dom';
import {Box, Button, Card, CardContent, Divider, Grid2, Typography, Container, Chip, Paper, Avatar, List, ListItem, ListItemText, ListItemAvatar} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTranslation } from 'react-i18next';
import './Guild.scss';

const Player = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
    const [guild, setGuild] = useState('');
    const [members, setMembers] = useState('');
    const [overall, setOverall] = useState('')
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();  // Initialisation du hook pour la navigation

    const visibleMembers = expanded ? members : members.slice(0, 3);

    const guildId = useParams().guildId;

    useEffect(() => {
        const getPlayerInfo = async (e) => {
            await api.get("/guilds/" + guildId).then(
                (response) => {
                    if (response.data.statut !== "OK") {
                        setError(response.data.message);
                    } else {
                        setGuild(response.data.guild);
                        setMembers(response.data.members);
                        setOverall(response.data.data.overall);
                        setError('');
                    }
                }
            ).catch((error) => console.error('Error fetching player:', error));
        }

        getPlayerInfo();
    }, [guildId]);

    const handleGoBack = () => {
        navigate('/guilds');  // Remplace "/dashboard" par le chemin du tableau de bord
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
            
            {guild && (
                <Grid2 container spacing={3}>
                    {/* Carte principale - Informations de la guilde */}
                    <Grid2 size={12}>
                        <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                                    <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                                        <GroupsIcon sx={{ fontSize: 60 }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                            {guild.Name}
                                        </Typography>
                                        {guild.AllianceTag && (
                                            <Chip 
                                                label={`[${guild.AllianceTag}]`} 
                                                color="secondary" 
                                                variant="outlined"
                                                sx={{ mb: 2 }}
                                            />
                                        )}
                                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarTodayIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('guild.founded_on', { date: new Date(guild.Founded).toLocaleDateString('fr-FR') })}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('guild.member_count', { count: guild.MemberCount })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {guild.FounderName && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    component="span"
                                                >
                                                    {t('guild.founder')}:{' '}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    component="span"
                                                    onClick={() => navigate(`/player/${guild.FounderId}`)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        color: 'primary.main',
                                                        textDecoration: 'underline',
                                                        '&:hover': { color: 'primary.dark' }
                                                    }}
                                                >
                                                    {guild.FounderName}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Statistiques */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <EmojiEventsIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        {t('guild.statistics')}
                                    </Typography>
                                </Box>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={12}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.4)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('guild.total_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {overall.fame.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('guild.kill_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {guild.killFame.toLocaleString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('guild.kills_count', { count: overall.kills })}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={6}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(155,59,59,0.15)', border: '1px solid rgba(155,59,59,0.35)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('guild.death_fame')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {guild.DeathFame.toLocaleString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('guild.deaths_count', { count: overall.deaths })}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
                                            <Typography variant="body2" color="text.secondary">{t('guild.ratio')}</Typography>
                                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                                {(() => {
                                                    const k = parseInt(guild.killFame, 10);
                                                    const d = parseInt(guild.DeathFame, 10);
                                                    return d > 0 ? Math.round((k / d) * 100) / 100 : '—';
                                                })()}
                                            </Typography>
                                        </Paper>
                                    </Grid2>
                                </Grid2>
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Liste des membres */}
                    <Grid2 size={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                                    {t('guild.members_title', { count: members.length })}
                                </Typography>
                                
                                <List>
                                    {visibleMembers.map((member, index) => (
                                        <React.Fragment key={member.Id}>
                                            <ListItem
                                                button
                                                onClick={() => navigate(`/player/${member.Id}`)}
                                                sx={{
                                                    borderRadius: 1,
                                                    mb: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover',
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={member.Name}
                                                    primaryTypographyProps={{
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </ListItem>
                                            {index < visibleMembers.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>

                                {members.length > 3 && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => setExpanded(!expanded)}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        {expanded ? t('guild.hide_members') : t('guild.show_all_members', { count: members.length })}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid2>
                </Grid2>
            )}

            {error && (
                <Card sx={{ mt: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <CardContent>
                        <Typography color="error" variant="h6">
                            {t('guild.error_fetch')}
                        </Typography>
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
};

export default Player;  // Le nom du composant doit aussi être en majuscule ici