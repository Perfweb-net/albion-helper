import React, {useState, useEffect} from 'react';
import api from '../api';
import {useNavigate, useParams} from 'react-router-dom';
import {Avatar, Box, Button, Card, CardContent, Divider, Grid2, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {isTokenValid} from "../components/PrivateRoute";

const Player = () => {  // Le nom du composant commence par une majuscule
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
        <>
            <Button onClick={handleGoBack} sx={{alignSelf: 'flex-start', marginLeft: 3, marginBottom: 2}} startIcon={<ArrowBackIcon/>}>
                back
            </Button>
            {player && (
                <Card sx={{maxWidth: 600, margin: "auto", padding: 2, boxShadow: 3}}>
                    <CardContent>
                        {/* Avatar et Nom */}
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar src={player.Avatar || "/default-avatar.png"} alt={player.Name}
                                    sx={{width: 80, height: 80}}/>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">{player.Name}</Typography>
                                <Typography variant="body2" color="textSecondary">ID: {player.Id}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{my: 2}}/>

                        <Typography variant="h6" sx={{mt: 2, mb: 2}}> Info Générale </Typography>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={6}>
                                <Typography variant="body1"><strong>Guilde:</strong> {player.GuildName || "Aucune"}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography variant="body1"><strong>Alliance:</strong> {player.AllianceName || "Aucune"}
                                </Typography>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{my: 2}}/>

                        {/* Statistiques PVP */}
                        <Typography variant="h6" sx={{mt: 2, mb: 2}}> Statistiques PVP< /Typography>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={6}>
                                <Typography variant="body1"><strong>Kill
                                    Fame:</strong> {player.KillFame.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography variant="body1"><strong>Death
                                    Fame:</strong> {player.DeathFame.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={12}>
                                <Typography variant="body1"><strong>Kill
                                    Ratio:</strong> {Math.round(player.KillFame / player.DeathFame * 100) / 100}
                                </Typography>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{my: 2}}/>

                        {/* Statistiques PvE et Gathering */}
                        <Typography variant="h6" sx={{mt: 2, mb: 2}}> Statistiques FAME < /Typography>
                        <Grid2 container spacing={2}>
                            <Grid2 item size={6}>
                                <Typography
                                    variant="body2"><strong>PvE:</strong> {player.LifetimeStatistics.PvE.Total.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography variant="body1"><strong>
                                    PvP:</strong> {player.KillFame.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography
                                    variant="body2"><strong>Gathering:</strong> {player.LifetimeStatistics.Gathering.All.Total.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography
                                    variant="body2"><strong>Crafting:</strong> {player.LifetimeStatistics.Crafting.Total.toLocaleString()}
                                </Typography>
                            </Grid2>
                            <Grid2 item size={6}>
                                <Typography variant="body2"><strong>Fishing
                                    Fame:</strong> {player.LifetimeStatistics.FishingFame.toLocaleString()}</Typography>
                            </Grid2>
                        </Grid2>

                        <Divider sx={{ my: 2 }} />

                        {/* Détails des statistiques PvE */}
                        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Détails PvE</Typography>
                        <Grid2 container spacing={2}>
                            {Object.entries(player.LifetimeStatistics.PvE).map(([key, value]) => (
                                <Grid2 item size={6} key={key}>
                                    <Typography variant="body2"><strong>{key}:</strong> {value.toLocaleString()}</Typography>
                                </Grid2>
                            ))}
                        </Grid2>

                        <Divider sx={{ my: 2 }} />

                        {/* Détails des statistiques Gathering */}
                        <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Détails Gathering</Typography>
                        <Grid2 container spacing={2}>
                            {Object.entries(player.LifetimeStatistics.Gathering).map(([resource, stats]) => (
                                <Grid2 item size={12} key={resource}>
                                    <Typography variant="subtitle1"><strong>{resource}</strong></Typography>
                                    <Grid2 container spacing={2}>
                                        {Object.entries(stats).map(([key, value]) => (
                                            <Grid2 item size={6} key={key}>
                                                <Typography variant="body2"><strong>{key}:</strong> {value.toLocaleString()}</Typography>
                                            </Grid2>
                                        ))}
                                    </Grid2>
                                </Grid2>
                            ))}
                        </Grid2>


                    </CardContent>
                </Card>
            )}
            {error && <Typography color="error">{error}</Typography>}
        </>
    )
};

export default Player;  // Le nom du composant doit aussi être en majuscule ici