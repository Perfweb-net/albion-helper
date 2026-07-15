import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import CircleIcon from '@mui/icons-material/Circle';
import DomainIcon from '@mui/icons-material/Domain';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import Crown from '../../components/svg/Crown';
import Portal from '../../components/svg/Portal';
import Tunnel from '../../components/svg/Tunnel';
import ParkIcon from '@mui/icons-material/Park';      // WOOD
import GrassIcon from '@mui/icons-material/Grass';    // FIBER
import LandscapeIcon from '@mui/icons-material/Landscape'; // ROCK
import DiamondIcon from '@mui/icons-material/Diamond'; // ORE (plus parlant)
import PetsIcon from '@mui/icons-material/Pets';      // HIDE

import {
    Box,
    Button,
    Container, Grid2,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
    Card,
    CardContent,
    Chip,
    Paper
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import './Map.scss';

const Map = () => {
    const { t } = useTranslation();
    const [maps, setMaps] = useState([]);
    const [mapsFitered, setMapsFitered] = useState([]);
    const [search, setSearch] = useState('');
    const [baseSearch, setBaseSearch] = useState('');
    const [showChestInfo, setShowChestInfo] = useState(true);
    const [showGatherInfo, setShowGatherInfo] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (baseSearch.length === 3) {
            await api.get(`/map/search?map=${baseSearch}`).then((response) => {
                setMaps(response.data.maps);
            }).catch((error) => console.error('Error fetching maps:', error));
        }
    }, [baseSearch]);

    const chestTypes = useMemo(() => ({
        "Big Avalonian Chest": {color: "gold", fontSize: "large", info: t('map.legend_chest_big_gold')},
        "Avalonian Chest": {color: "gold", fontSize: "small", info: t('map.legend_chest_gold')},
        "Big Group Chest": {color: "blue", fontSize: "large", info: t('map.legend_chest_blue')},
        "Big Solo Chest": {color: "green", fontSize: "large", info: t('map.legend_chest_big_green')},
        "Solo Chest": {color: "green", fontSize: "small", info: t('map.legend_chest_green')}
    }), [t]);

    const mapTypes = useMemo(() => ({
        "TUNNEL_ROYAL":{icon:<Crown/>, info:t('map.legend_royal')},
        "TUNNEL_ROYAL_RED": {icon:<Crown color="red"/>, info:t('map.legend_royal_red')},

        "TUNNEL_DEEP_RAID": {icon:<GroupsIcon sx={{color: "gold", fontSize: "large", background: "grey", padding: "3px"}}/>, info:t('map.legend_portal_gold')},
        "TUNNEL_DEEP": {icon:<Portal/>, info:t('map.legend_portal_back')},

        "TUNNEL_LOW": {icon:<Tunnel color="green" width={20} height={20}/>, info:t('map.legend_ava_low')},
        "TUNNEL_MEDIUM": {icon:<Tunnel color="blue" width={20} height={20}/>, info:t('map.legend_ava_medium')},
        "TUNNEL_HIGH": {icon:<Tunnel color="gold" width={20} height={20}/>, info:t('map.legend_ava_high')},

        "TUNNEL_BLACK_LOW": {icon:<HomeIcon sx={{color: "green", fontSize: "large"}}/>, info:t('map.legend_bz_low')},
        "TUNNEL_BLACK_MEDIUM": {icon:<HomeIcon sx={{color: "blue", fontSize: "large"}}/>, info:t('map.legend_bz_medium')},
        "TUNNEL_BLACK_HIGH": {icon:<HomeIcon sx={{color: "gold", fontSize: "large"}}/>, info:t('map.legend_bz_high')},

        "TUNNEL_HIDEOUT": {icon:<DomainIcon sx={{color: "green", fontSize: "large"}}/>, info:t('map.legend_ho')},
        "TUNNEL_HIDEOUT_DEEP": {icon:<DomainIcon sx={{color: "gold", fontSize: "large"}}/>, info:t('map.legend_ho_deep')},
    }), [t]);

    const filteredMapTypes = useMemo(() => {
        if (mapsFitered.length === 0) return mapTypes; // Si aucun filtre, on affiche tout
        const usedTypes = new Set(mapsFitered.map(map => map.type));
        return Object.fromEntries(Object.entries(mapTypes).filter(([type]) => usedTypes.has(type)));
    }, [mapsFitered, mapTypes]);

    const filteredChestTypes = useMemo(() => {
        if (mapsFitered.length === 0) return chestTypes; // Si aucun filtre, on affiche tout
        const usedChests = new Set();
        mapsFitered.forEach(map => {
            map.zoneInfo.markers.forEach(marker => {
                if (chestTypes[marker.name]) {
                    usedChests.add(marker.name);
                }
            });
        });
        return Object.fromEntries(Object.entries(chestTypes).filter(([type]) => usedChests.has(type)));
    }, [mapsFitered, chestTypes]);

    const resourceIcons = {
        WOOD: <ParkIcon sx={{ color: "saddlebrown" }} />, // Bois
        FIBER: <GrassIcon sx={{ color: "green" }} />,    // Fibre
        ROCK: <LandscapeIcon sx={{ color: "grey" }} />,  // Pierre
        ORE: <DiamondIcon sx={{ color: "orange" }} />,  // Minerai
        HIDE: <PetsIcon sx={{ color: "peru" }} />,       // Peau
    };

    // Mapping i18n pour les ressources
    const resourceLabels = {
        WOOD: t('map.resource_wood'),
        FIBER: t('map.resource_fiber'),
        ROCK: t('map.resource_rock'),
        ORE: t('map.resource_ore'),
        HIDE: t('map.resource_hide'),
    };

    const handleChange = (e) => {
        setSearch(e.target.value)
    };

    useEffect(() => {
        if (search.length === 3 || (search.length > 3 && baseSearch === "") || (search.length >= 3 && search.slice(0, 3) !== baseSearch)) {
            setBaseSearch(search.slice(0, 3));
        } else if (search.length < 3) {
            setBaseSearch('');
            setMaps([]);
            setMapsFitered([]);
        }
    }, [search, baseSearch]);

    useEffect(() => {
        if (baseSearch.length === 3) {
            handleSubmit();  // Déclenche handleSubmit uniquement lorsque baseSearch est mis à jour
        } else {
            setMapsFitered([]);
        }
    }, [baseSearch, handleSubmit]);

    useEffect(() => {
        if (baseSearch.length === 3) {
            setMapsFitered(maps.filter((map) => {
                return map.name.toLowerCase().includes(search.toLowerCase());
            }));
        } else {
            setMapsFitered([]);
        }
    }, [baseSearch, maps, search]);

    // Ajout des tailles d'icônes pour les mobs
    const mobResourceIconSize = {
        giant: 48, // taille grande
        elite: 24, // taille petite
    };

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={700} gutterBottom className="ah-page-title ah-page-title--center">
                        {t('map.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('map.subtitle')}
                    </Typography>
                </Box>

                <Card sx={{ mb: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                            <Grid2 size={{xs: 12, md: 8}}>
                                <TextField
                                    label={t('map.search_label')}
                                    variant="outlined"
                                    fullWidth
                                    value={search}
                                    onChange={(e) => handleChange(e)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit();
                                        }
                                    }}
                                    placeholder={t('map.search_min_chars')}
                                />
                            </Grid2>

                            <Grid2 size={{xs: 12, md: 4}}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    size="large"
                                    startIcon={<SearchIcon />}
                                    sx={{ py: 1.5 }}
                                >
                                    {t('common.search')}
                                </Button>
                            </Grid2>

                            <Grid2 size={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mt: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showChestInfo}
                                                onChange={(e) => setShowChestInfo(e.target.checked)}
                                                name="showChestInfo"
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant="body1" fontWeight={500}>
                                                {t('map.show_chests')}
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={showGatherInfo}
                                                onChange={(e) => setShowGatherInfo(e.target.checked)}
                                                name="showGatherInfo"
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant="body1" fontWeight={500}>
                                                {t('map.show_resources')}
                                            </Typography>
                                        }
                                    />
                                </Box>
                            </Grid2>
                        </Grid2>
                    </CardContent>
                </Card>

                    {mapsFitered.length > 0 && (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                                {t('map.results_count', { count: mapsFitered.length })}
                            </Typography>

                            <Grid2 container spacing={3}>
                                {mapsFitered.map((map) => {
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

                                    // Détection des mobs géants ou élites par ressource (avec comptage séparé)
                                    const mobResourceIconsMap = {};
                                    (map.zoneInfo.mobs || []).forEach(mob => {
                                        let resourceType = null;
                                        let mobType = null;

                                        if ((mob.name.toLowerCase().includes('giant') || mob.name.toLowerCase().includes('guardian') || mob.name.toLowerCase().includes('BASILISK'))) {
                                            mobType = 'giant';
                                        } else if (mob.name.toLowerCase().includes('elite') ||  mob.name.toLowerCase().includes('veteran')) {
                                            mobType = 'elite';
                                        }

                                        if (mobType) {
                                            if (mob.name.includes('WOOD') || mob.name.includes('ENT')) {
                                                resourceType = 'WOOD';
                                            } else if (mob.name.includes('FIBER') || mob.name.includes('DRYAD')) {
                                                resourceType = 'FIBER';
                                            } else if (mob.name.includes('ROCK') || mob.name.includes('ROCKGIANT')) {
                                                resourceType = 'ROCK';
                                            } else if (mob.name.includes('ORE') || mob.name.includes('OREGIANT')) {
                                                resourceType = 'ORE';
                                            } else if (mob.name.includes('HIDE') || mob.name.includes('BASILISK')) {
                                                resourceType = 'HIDE';
                                            }
                                        }

                                        if (resourceType && mobType) {
                                            if (!mobResourceIconsMap[resourceType]) {
                                                mobResourceIconsMap[resourceType] = {};
                                            }
                                            if (!mobResourceIconsMap[resourceType][mobType]) {
                                                mobResourceIconsMap[resourceType][mobType] = {
                                                    count: 0,
                                                    size: mobResourceIconSize[mobType],
                                                    icon: resourceIcons[resourceType]
                                                };
                                            }
                                            mobResourceIconsMap[resourceType][mobType].count++;
                                        }
                                    });
                                    const mobResourceEntries = Object.entries(mobResourceIconsMap);

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
                                                    <Box sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        mb: 2
                                                    }}>
                                                        {mapTypes[map.type]?.icon}
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
                                                    {showChestInfo && Object.keys(chestCounts).length > 0 && (
                                                        <Box sx={{
                                                            mt: 2,
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            flexWrap: "wrap",
                                                            gap: 1.5
                                                        }}>
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

                                                    {/* Affichage des mobs géants/élites de ressource */}
                                                    {showGatherInfo && mobResourceEntries.length > 0 && (
                                                        <Box sx={{
                                                            mt: 2,
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            flexWrap: "wrap",
                                                            gap: 1.5,
                                                        }}>
                                                            {mobResourceEntries.map(([type, mobs], idx) => (
                                                                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                                    {mobs.giant && (
                                                                        <Chip
                                                                            icon={React.cloneElement(mobs.giant.icon, { style: { fontSize: mobs.giant.size } })}
                                                                            label={`x${mobs.giant.count}`}
                                                                            size="small"
                                                                            color="primary"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                    {mobs.elite && (
                                                                        <Chip
                                                                            icon={React.cloneElement(mobs.elite.icon, { style: { fontSize: mobs.elite.size } })}
                                                                            label={`x${mobs.elite.count}`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </Box>
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

                <Paper sx={{ p: 4, mt: 4, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        {t('map.legend')}
                    </Typography>
                    <Grid2 container spacing={2}>
                        {/* Affichage des types de tunnels */}
                        {Object.entries(filteredMapTypes).map(([type, { icon, info }]) => (
                            <Grid2 xs={6} sm={4} md={3} key={type}>
                                <Box
                                    sx={{
                                        padding: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "background.paper",
                                        transition: 'all 0.2s ease',
                                        '&:hover': { 
                                            backgroundColor: "action.hover",
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    {icon} 
                                    <Typography variant="body2" sx={{ fontWeight: 500, marginLeft: 1 }}>
                                        {info}
                                    </Typography>
                                </Box>
                            </Grid2>
                        ))}

                        {/* Affichage des types de coffres */}
                        {showChestInfo && Object.entries(filteredChestTypes).map(([type, { color, fontSize, info }]) => {
                            const isBigChest = type.includes("Big");
                            return (
                                <Grid2 xs={6} sm={4} md={3} key={type}>
                                    <Box
                                        sx={{
                                            padding: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            textAlign: "center",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "background.paper",
                                            transition: 'all 0.2s ease',
                                            '&:hover': { 
                                                backgroundColor: "action.hover",
                                                transform: 'translateY(-2px)',
                                                boxShadow: 2
                                            }
                                        }}
                                    >
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
                                                        border: `2px solid ${color}`,
                                                        animation: 'pulse 2s ease-in-out infinite',
                                                    }}
                                                />
                                            )}
                                            <CircleIcon sx={{ color, fontSize, position: 'relative', zIndex: 1 }} />  
                                        </Box>
                                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                            {info}
                                        </Typography>
                                    </Box>
                                </Grid2>
                            );
                        })}

                        {/* Affichage des types de ressources */}
                        {showGatherInfo && Object.entries(resourceIcons).map(([type, icon]) => (
                            <Grid2 xs={6} sm={4} md={3} key={type}>
                                <Box
                                    sx={{
                                        padding: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "background.paper",
                                        transition: 'all 0.2s ease',
                                        '&:hover': { 
                                            backgroundColor: "action.hover",
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    {icon} 
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                        {resourceLabels[type]}
                                    </Typography>
                                </Box>
                            </Grid2>
                        ))}
                    </Grid2>
                </Paper>
            </Container>
        </>
    );
};

export default Map;
