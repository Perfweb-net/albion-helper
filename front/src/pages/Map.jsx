import React, {useEffect, useState} from 'react';
import api from '../api';
import {useNavigate} from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';
import {
    Box,
    Button,
    Container, Grid2,
    TextField,
    Typography
} from "@mui/material";

const Map = () => {
    const [maps, setMaps] = useState([]);
    const [search, setSearch] = useState('');

    const handleSubmit = async () => {
        await api.get(`/map/search?map=${search}`).then((response) => {
            setMaps(response.data.maps);
        }).catch((error) => console.error('Error fetching maps:', error));
    };

    // Définition des couleurs et tailles des coffres
    const chestTypes = {
        "Big Avalonian Chest": {color: "gold", fontSize: "large"},
        "Avalonian Chest": {color: "gold", fontSize: "small"},
        "Big Group Chest": {color: "blue", fontSize: "large"},
        "Big Solo Chest": {color: "green", fontSize: "large"},
        "Solo Chest": {color: "green", fontSize: "small"}
    };

    const handleChange = (e) => {
        setSearch(e.target.value)
    };

    useEffect(() => {
        if (search.length > 3) {
            handleSubmit();
        }else {
            setMaps([]);
        }
    }, [search]);

    return (
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

                <Grid2 container spacing={2} sx={{width: '100%', alignItems: 'center', marginBottom: 2}}>
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

                {maps.length > 0 && (
                    <Box sx={{marginTop: 4, width: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Maps:
                        </Typography>

                        <Grid2 container spacing={2}>
                            {maps.map((map) => {
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
                                            <Typography variant="body2" color="textSecondary">
                                                {map.name}
                                            </Typography>

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
    );
};

export default Map;
