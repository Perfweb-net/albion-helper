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
        "Big Avalonian Chest": {color: "gold", fontSize: "large"},
        "Avalonian Chest": {color: "gold", fontSize: "small"},
        "Big Group Chest": {color: "blue", fontSize: "large"},
        "Big Solo Chest": {color: "green", fontSize: "large"},
        "Solo Chest": {color: "green", fontSize: "small"}
    }), []);

    const mapTypes = useMemo(() => ({
        "TUNNEL_ROYAL": <Crown/>,
        "TUNNEL_ROYAL_RED": <Crown color="red"/>,

        "TUNNEL_DEEP_RAID": <GroupsIcon sx={{color: "gold", fontSize: "large", background: "grey", padding: "3px"}}/>,
        "TUNNEL_DEEP": <Portal/>,

        "TUNNEL_LOW": <Tunnel color="grey" width={20} height={20}/>,
        "TUNNEL_MEDIUM": <Tunnel color="blue" width={20} height={20}/>,
        "TUNNEL_HIGH": <Tunnel color="gold" width={20} height={20}/>,

        "TUNNEL_BLACK_HIGH": <HomeIcon sx={{color: "grey", fontSize: "large"}}/>,
        "TUNNEL_BLACK_MEDIUM": <HomeIcon sx={{color: "blue", fontSize: "large"}}/>,
        "TUNNEL_BLACK_LOW": <HomeIcon sx={{color: "gold", fontSize: "large"}}/>,

        "TUNNEL_HIDEOUT": <DomainIcon sx={{color: "green", fontSize: "large"}}/>,
        "TUNNEL_HIDEOUT_DEEP": <DomainIcon sx={{color: "gold", fontSize: "large"}}/>,
    }), []);

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
                                                    {mapTypes[map.type]}
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
            </Container>
        </>
    );
};

export default Map;
