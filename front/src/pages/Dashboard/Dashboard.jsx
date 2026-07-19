import React, {useEffect, useState} from 'react';
import api from '../../api';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
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
    Chip
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddEmailBanner from '../../components/AddEmailBanner';
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import MapIcon from "@mui/icons-material/Map";
import './Dashboard.scss';

const Dashboard = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
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

    const handleSubmit = async (term) => {
        if (selection === 'map') {
            await api.get(`/map/search?map=${term}`).then((response) => {
                setMaps(response.data.maps);
                setPlayers([]);
                setGuilds([]);
            }).catch((error) => console.error('Error fetching maps:', error));
        }else {
            await api.get("/player/search?pseudo=" + term).then(
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

    // Auto-recherche dès 3 caractères, comme les autres écrans de recherche
    const { query: pseudo, setQuery: setPseudo, triggerSearch } = useDebouncedSearch(handleSubmit);

    // Changer de type (joueur/guilde/carte) relance la recherche courante
    useEffect(() => {
        if (pseudo.trim().length >= 3) {
            handleSubmit(pseudo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection]);

    return (
        <Container maxWidth="lg" className="dashboard__container">
            <AddEmailBanner />
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
                                        triggerSearch();
                                    }
                                }}
                                placeholder={t('dashboard.search_placeholder')}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, sm: 2}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={triggerSearch}
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

                        <Box className="dashboard__results-track">
                            {players.map((player) => (
                                <Card
                                    key={player.Id}
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
                            ))}
                        </Box>
                    </Box>
                )}

                {guilds && guilds.length > 0 && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            {t('dashboard.guilds_found', { count: guilds.length })}
                        </Typography>

                        <Box className="dashboard__results-track">
                            {guilds.map((guild) => (
                                <Card
                                    key={guild.Id}
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
                            ))}
                        </Box>
                    </Box>
                )}

                {maps.length > 0 && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            {t('dashboard.maps_found', { count: maps.length })}
                        </Typography>

                        <Box className="dashboard__results-track">
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
                                const chestCounts = (map.zoneInfo?.markers || []).reduce((acc, marker) => {
                                    if (chestTypes[marker.name]) {
                                        acc[marker.name] = (acc[marker.name] || 0) + 1;
                                    }
                                    return acc;
                                }, {});

                                return (
                                        <Card
                                            key={map.name}
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

                                                {/* Affichage des coffres — même rendu que Map.jsx : hors Chip,
                                                    dont le style interne écrase la couleur des pastilles */}
                                                {Object.keys(chestCounts).length > 0 && (
                                                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
                                                        {Object.entries(chestCounts).map(([type, count], index) => {
                                                            const isBigChest = type.includes("Big");
                                                            return (
                                                                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                    <Box
                                                                        sx={{
                                                                            position: 'relative',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        {isBigChest && (
                                                                            <Box
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    borderRadius: '50%',
                                                                                    border: `2px solid ${chestTypes[type].color}`,
                                                                                    animation: 'pulse 2s ease-in-out infinite',
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <CircleIcon sx={{
                                                                            color: chestTypes[type].color,
                                                                            fontSize: chestTypes[type].fontSize,
                                                                            position: 'relative',
                                                                            zIndex: 1
                                                                        }} />
                                                                    </Box>
                                                                    <Typography variant="body2" fontWeight={500}>
                                                                        {count}
                                                                    </Typography>
                                                                </Box>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                );
                            })}
                        </Box>
                    </Box>
                )}
        </Container>
    );
};

export default Dashboard;  // Le nom du composant doit aussi être en majuscule ici
