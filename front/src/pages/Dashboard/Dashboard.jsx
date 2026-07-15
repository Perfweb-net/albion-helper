import React, {useState} from 'react';
import api from '../../api';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Container,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Card,
    CardContent,
    Paper,
    Chip
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import MapIcon from "@mui/icons-material/Map";
import './Dashboard.scss';

const Dashboard = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
    const [pseudo, setPseudo] = useState('');
    const [players, setPlayers] = useState('');
    const [guilds, setGuilds] = useState('');
    const [selection, setSelection] = useState('joueur');
    const [maps, setMaps] = useState([]);
    const navigate = useNavigate();
    const chestTypes = {
        "Big Avalonian Chest": { color: "gold", fontSize: "large" },
        "Avalonian Chest": { color: "gold", fontSize: "small" },
        "Big Group Chest": { color: "blue", fontSize: "large" },
        "Big Solo Chest": { color: "green", fontSize: "large" },
        "Solo Chest": { color: "green", fontSize: "small" }
    };

    const handleSubmit = async (e) => {
        if (selection === 'map') {
            await api.get(`/map/search?map=${pseudo}`).then((response) => {
                setMaps(response.data.maps);
                setPlayers([]);
                setGuilds([]);
            }).catch((error) => console.error('Error fetching maps:', error));
        }else {
            await api.get("/player/search?pseudo=" + pseudo).then(
                (response) => {
                    if (selection === 'joueur') {
                        setPlayers(response.data.players);
                        setGuilds([]);
                        setMaps([]);
                    } else {
                        setGuilds(response.data.guilds);
                        setPlayers([]);
                        setMaps([]);
                    }
                }
            ).catch((error) => console.error('Error fetching player:', error));
        }
    }

    return (
        <Container maxWidth="lg" className="dashboard__container">
            <Box className="dashboard__header">
                <Typography variant="h3" className="dashboard__title ah-page-title ah-page-title--center" gutterBottom>
                    {t('dashboard.title')}
                </Typography>
                <Typography variant="body1" className="dashboard__subtitle">
                    {t('dashboard.search_subtitle')}
                </Typography>
            </Box>

            <Card className="dashboard__search-card">
                <CardContent className="dashboard__search-content">
                    <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                        <Grid2 size={{xs: 12, sm: 3}}>
                            <FormControl fullWidth>
                                <InputLabel id="search-type-label">{t('dashboard.search_type_label')}</InputLabel>
                                <Select
                                    labelId="search-type-label"
                                    value={selection}
                                    onChange={(e) => setSelection(e.target.value)}
                                    label={t('dashboard.search_type_label')}
                                >
                                    <MenuItem value="joueur">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon fontSize="small" />
                                            {t('dashboard.menu_players')}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="guilde">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupsIcon fontSize="small" />
                                            {t('dashboard.menu_guild')}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="map">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MapIcon fontSize="small" />
                                            {t('dashboard.menu_map')}
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{xs: 12, sm: 7}}>
                            <TextField
                                label={t('common.search')}
                                variant="outlined"
                                fullWidth
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit();
                                    }
                                }}
                                placeholder={t('dashboard.search_placeholder')}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, sm: 2}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                fullWidth
                                size="large"
                                startIcon={<SearchIcon />}
                                className="dashboard__button"
                            >
                                {t('common.search')}
                            </Button>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>

                {/* Liste des joueurs */}
                {players && players.length > 0 && (
                    <Box className="dashboard__results-section">
                        <Typography variant="h5" className="dashboard__results-title" gutterBottom>
                            {t('dashboard.players_found', { count: players.length })}
                        </Typography>

                        <Grid2 container spacing={3}>
                            {players.map((player) => (
                                <Grid2 size={{xs: 12, sm: 6, md: 4}} key={player.Id}>
                                    <Card
                                        className="dashboard__item-card"
                                        onClick={() => navigate(`/player/${player.Id}`)}
                                    >
                                        <CardContent className="dashboard__item-content">
                                            <PersonIcon className="dashboard__item-icon" />
                                            {player.AllianceName && (
                                                <Chip 
                                                    label={player.AllianceName} 
                                                    size="small" 
                                                    sx={{ mb: 1 }}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            <Typography variant="h6" className="dashboard__item-name">
                                                {player.Name}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            ))}
                        </Grid2>
                    </Box>
                )}

                {guilds && guilds.length > 0 && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            {t('dashboard.guilds_found', { count: guilds.length })}
                        </Typography>

                        <Grid2 container spacing={3}>
                            {guilds.map((guild) => (
                                <Grid2 size={{xs: 12, sm: 6, md: 4}} key={guild.Id}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
                                            }
                                        }}
                                        onClick={() => navigate(`/guild/${guild.Id}`)}
                                    >
                                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                            <GroupsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                            <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                                                {guild.Name}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            ))}
                        </Grid2>
                    </Box>
                )}

                {maps.length > 0 && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            {t('dashboard.maps_found', { count: maps.length })}
                        </Typography>

                        <Grid2 container spacing={3}>
                            {maps.map((map) => {
                                // Déterminer la couleur du fond selon le tier et le nom
                                let backgroundColor = "transparent";
                                let tierColor = "default";
                                if (map.name.includes("-")) {
                                    if (map.tier === 4) {
                                        backgroundColor = "#f0f0f0";
                                        tierColor = "default";
                                    }
                                    if (map.tier === 6) {
                                        backgroundColor = "#e0f7ff";
                                        tierColor = "info";
                                    }
                                    if (map.tier === 8) {
                                        backgroundColor = "#fff5cc";
                                        tierColor = "warning";
                                    }
                                }

                                // Compter les types de coffres
                                const chestCounts = map.zoneInfo.markers.reduce((acc, marker) => {
                                    if (chestTypes[marker.name]) {
                                        acc[marker.name] = (acc[marker.name] || 0) + 1;
                                    }
                                    return acc;
                                }, {});

                                return (
                                    <Grid2 xs={12} sm={6} md={4} key={map.name}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                height: '100%',
                                                backgroundColor: backgroundColor,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                                                    <MapIcon sx={{ color: 'primary.main' }} />
                                                    <Typography variant="h6" fontWeight={600}>
                                                        {map.name}
                                                    </Typography>
                                                </Box>
                                                
                                                {map.tier && (
                                                    <Chip 
                                                        label={`Tier ${map.tier}`} 
                                                        size="small" 
                                                        color={tierColor}
                                                        sx={{ mb: 2 }}
                                                    />
                                                )}

                                                {/* Affichage des coffres */}
                                                {Object.keys(chestCounts).length > 0 && (
                                                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
                                                        {Object.entries(chestCounts).map(([type, count], index) => (
                                                            <Chip
                                                                key={index}
                                                                icon={<CircleIcon sx={{ color: chestTypes[type].color, fontSize: chestTypes[type].fontSize }} />}
                                                                label={count}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid2>
                                );
                            })}
                        </Grid2>
                    </Box>
                )}
        </Container>
    );
};

export default Dashboard;  // Le nom du composant doit aussi être en majuscule ici
