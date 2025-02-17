import React, {useState} from 'react';
import api from '../api';
import {useNavigate} from 'react-router-dom';
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
    Typography
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import {isTokenValid} from "../components/PrivateRoute";

const Dashboard = () => {  // Le nom du composant commence par une majuscule
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
        const token = localStorage.getItem('token');

        await isTokenValid(token)

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
                    Dashboard
                </Typography>

                <Grid2 container spacing={2} sx={{width: '100%', alignItems: 'center', marginBottom: 2}}>
                    <Grid2 size={2}>
                        <FormControl fullWidth variant="standard">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={selection}
                                onChange={(e) => setSelection(e.target.value)}
                                label="Type"
                                variant="standard"
                            >
                                <MenuItem value="joueur">Joueurs</MenuItem>
                                <MenuItem value="guilde">Guilde</MenuItem>
                                <MenuItem value="map">Map</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 size={10}>
                        <TextField
                            label="Pseudo"
                            variant="outlined"
                            fullWidth
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            required
                        />
                    </Grid2>
                </Grid2>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                >
                    Submit
                </Button>

                {/* Liste des joueurs */}
                {players &&players.length > 0 && (
                    <Box sx={{marginTop: 4, width: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Players:
                        </Typography>

                        <Grid2 container spacing={2}>
                            {players.map((player) => (
                                <Grid2 size={{xs: 12, sm: 6, md: 4}} key={player.Id}>
                                    <Box
                                        sx={{
                                            padding: 2,
                                            border: '1px solid #ccc',
                                            borderRadius: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            }
                                        }}
                                        onClick={() => navigate(`/player/${player.Id}`)}
                                    >
                                        <Typography variant="body2" color="textSecondary">
                                            {player.AllianceName ? player.AllianceName : '-'}
                                        </Typography>

                                        <Typography variant="body1" fontWeight="bold">
                                            {player.Name}
                                        </Typography>
                                    </Box>
                                </Grid2>
                            ))}
                        </Grid2>
                    </Box>
                )}

                {guilds && guilds.length > 0 && (
                    <Box sx={{marginTop: 4, width: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Guilds:
                        </Typography>

                        <Grid2 container spacing={2}>
                            {guilds.map((guild) => (
                                <Grid2 size={{xs: 12, sm: 6, md: 4}} key={guild.AllianceId}>
                                    <Box
                                        sx={{
                                            padding: 2,
                                            border: '1px solid #ccc',
                                            borderRadius: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            }
                                        }}
                                        onClick={() => navigate(`/guild/${guild.Id}`)}
                                    >
                                        <Typography variant="body1" fontWeight="bold">
                                            {guild.Name}
                                        </Typography>
                                    </Box>
                                </Grid2>
                            ))}
                        </Grid2>
                    </Box>
                )}

                {maps.length > 0 && (
                    <Box sx={{ marginTop: 4, width: '100%' }}>
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
                                            <Box sx={{ mt: 1, display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                                                {Object.entries(chestCounts).map(([type, count], index) => (
                                                    <Box key={index} sx={{ display: "flex", alignItems: "center", mx: 1 }}>
                                                        <CircleIcon sx={{ color: chestTypes[type].color, fontSize: chestTypes[type].fontSize }} />
                                                        <Typography variant="body2" sx={{ ml: 0.5 }}>
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

export default Dashboard;  // Le nom du composant doit aussi être en majuscule ici
