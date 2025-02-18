import React, {useCallback, useEffect, useMemo, useState} from 'react';
import api from '../api';
import CircleIcon from '@mui/icons-material/Circle';
import DomainIcon from '@mui/icons-material/Domain';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import Crown from '../components/svg/Crown';
import Portal from '../components/svg/Portal';
import Tunnel from '../components/svg/Tunnel';

import {
    Box,
    Button,
    Container, Grid2,
    TextField,
    Typography
} from "@mui/material";
import {isTokenValid} from "../components/PrivateRoute";

const Map = () => {
    const [maps, setMaps] = useState([]);
    const [mapsFitered, setMapsFitered] = useState([]);
    const [search, setSearch] = useState('');
    const [baseSearch, setBaseSearch] = useState('');

    const handleSubmit = useCallback(async () => {
        if (baseSearch.length === 3) {
            const token = localStorage.getItem('token');

            await isTokenValid(token)

            await api.get(`/map/search?map=${baseSearch}`).then((response) => {
                setMaps(response.data.maps);
            }).catch((error) => console.error('Error fetching maps:', error));
        }
    }, [baseSearch]);

    const chestTypes = useMemo(() => ({
        "Big Avalonian Chest": {color: "gold", fontSize: "large", info: "Grand Coffre Gold"},
        "Avalonian Chest": {color: "gold", fontSize: "small", info: "Coffre Gold"},
        "Big Group Chest": {color: "blue", fontSize: "large", info: "Coffre Bleu"},
        "Big Solo Chest": {color: "green", fontSize: "large", info: "Grand Coffre Vert"},
        "Solo Chest": {color: "green", fontSize: "small", info: "Coffre Vert"}
    }), []);

    const mapTypes = useMemo(() => ({
        "TUNNEL_ROYAL":{icon:<Crown/>, info:"Royal Bleu/Jaune"},
        "TUNNEL_ROYAL_RED": {icon:<Crown color="red"/>, info:"Royal Rouge"},

        "TUNNEL_DEEP_RAID": {icon:<GroupsIcon sx={{color: "gold", fontSize: "large", background: "grey", padding: "3px"}}/>, info:"Portail Gold"},
        "TUNNEL_DEEP": {icon:<Portal/>, info:"Retour bréci"},

        "TUNNEL_LOW": {icon:<Tunnel color="green" width={20} height={20}/>, info:"Suite ava basse"},
        "TUNNEL_MEDIUM": {icon:<Tunnel color="blue" width={20} height={20}/>, info:"Suite ava moyenne"},
        "TUNNEL_HIGH": {icon:<Tunnel color="gold" width={20} height={20}/>, info:"Suite ava haute"},

        "TUNNEL_BLACK_LOW": {icon:<HomeIcon sx={{color: "green", fontSize: "large"}}/>, info:"Suite bz basse"},
        "TUNNEL_BLACK_MEDIUM": {icon:<HomeIcon sx={{color: "blue", fontSize: "large"}}/>, info:"Suite bz moyenne"},
        "TUNNEL_BLACK_HIGH": {icon:<HomeIcon sx={{color: "gold", fontSize: "large"}}/>, info:"Suite bz haute"},

        "TUNNEL_HIDEOUT": {icon:<DomainIcon sx={{color: "green", fontSize: "large"}}/>, info:"HO"},
        "TUNNEL_HIDEOUT_DEEP": {icon:<DomainIcon sx={{color: "gold", fontSize: "large"}}/>, info:"HO Deep"},
    }), []);

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

    return (
        <>
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        marginTop: 4
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Maps
                    </Typography>

                    <Grid2 container spacing={2} sx={{width: '100%', alignItems: 'center'}}>
                        <Grid2 size={12}>
                            <TextField
                                label="Map"
                                variant="outlined"
                                fullWidth
                                value={search}
                                onChange={(e) => handleChange(e)}
                                required
                            />
                        </Grid2>

                        <Grid2 size={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                            >
                                Search
                            </Button>
                        </Grid2>
                    </Grid2>

                    {mapsFitered.length > 0 && (
                        <Box sx={{marginTop: 4, width: '100%'}}>
                            <Typography variant="h6" gutterBottom>
                                Maps:
                            </Typography>

                            <Grid2 container spacing={2}>
                                {mapsFitered.map((map) => {
                                    // Déterminer la couleur du fond selon le tier et le nom
                                    let backgroundColor = "transparent";
                                    if (map.name.includes("-")) {
                                        if (map.tier === 4) backgroundColor = "#f0f0f0"; // Gris très léger
                                        if (map.tier === 6) backgroundColor = "#e0f7ff"; // Bleu très léger
                                        if (map.tier === 8) backgroundColor = "#fff5cc"; // Gold très léger
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
                                            <Box
                                                sx={{
                                                    padding: 2,
                                                    border: '1px solid #ccc',
                                                    borderRadius: 2,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: backgroundColor,
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5',
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    gap: 1
                                                }}>
                                                    {mapTypes[map.type].icon}
                                                    <Typography variant="body2" color="textSecondary"
                                                                sx={{fontWeight: 'bold'}}>
                                                        {map.name}
                                                    </Typography>
                                                </Box>

                                                {/* Affichage des coffres */}
                                                <Box sx={{
                                                    mt: 1,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    flexWrap: "wrap"
                                                }}>
                                                    {Object.entries(chestCounts).map(([type, count], index) => (
                                                        <Box key={index}
                                                             sx={{display: "flex", alignItems: "center", mx: 1}}>
                                                            <CircleIcon sx={{
                                                                border: "1px solid black",
                                                                borderRadius: "50%",
                                                                color: chestTypes[type].color,
                                                                fontSize: chestTypes[type].fontSize
                                                            }}/>
                                                            <Typography variant="body2" sx={{ml: 0.5}}>
                                                                {count}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Grid2>
                                    );
                                })}
                            </Grid2>
                        </Box>
                    )}
                </Box>

                <Box sx={{ marginTop: 4, width: "100%" }}>
                    <Typography variant="h6" gutterBottom>
                        Légende
                    </Typography>

                    <Grid2 container spacing={2}>
                        {/* Affichage des types de tunnels */}
                        {Object.entries(filteredMapTypes).map(([type, { icon, info }]) => (
                            <Grid2 xs={6} sm={4} md={2} key={type}>
                                <Box
                                    sx={{
                                        padding: 2,
                                        border: "1px solid #ccc",
                                        borderRadius: 2,
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f9f9f9",
                                        '&:hover': { backgroundColor: "#e0e0e0" }
                                    }}
                                >
                                    {icon} <Typography variant="body2" color="textSecondary" sx={{ fontWeight: "bold", marginLeft: 1 }}>{info}</Typography>
                                </Box>
                            </Grid2>
                        ))}

                        {/* Affichage des types de coffres */}
                        {Object.entries(filteredChestTypes).map(([type, { color, fontSize, info }]) => (
                            <Grid2 xs={6} sm={4} md={2} key={type}>
                                <Box
                                    sx={{
                                        padding: 2,
                                        border: "1px solid #ccc",
                                        borderRadius: 2,
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f9f9f9",
                                        '&:hover': { backgroundColor: "#e0e0e0" }
                                    }}
                                >
                                    <CircleIcon sx={{ color, fontSize }} />  <Typography variant="body2" sx={{ ml: 1 }}>{info}</Typography>
                                </Box>
                            </Grid2>
                        ))}
                    </Grid2>
                </Box>
            </Container>
        </>
    );
};

export default Map;
