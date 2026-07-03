import React, {useState} from 'react';
import api from '../../api';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid2,
    TextField,
    Typography,
    Card,
    CardContent,
    Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import {isTokenValid} from "../../components/PrivateRoute";
import { useTranslation } from 'react-i18next';
import './Players.scss';

const Players = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
    const [pseudo, setPseudo] = useState('');
    const [players, setPlayers] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token');

        await isTokenValid(token)
        await api.get("/player/search?pseudo=" + pseudo).then(
            (response) => {
                    setPlayers(response.data.players);
            }
        ).catch((error) => console.error('Error fetching player:', error));
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    {t('nav.players')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('players.subtitle')}
                </Typography>
            </Box>

            <Card sx={{ mb: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                        <Grid2 size={{xs: 12, md: 10}}>
                            <TextField
                                label={t('players.search_label')}
                                variant="outlined"
                                fullWidth
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit();
                                    }
                                }}
                                placeholder={t('player.search_placeholder')}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 2}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                fullWidth
                                size="large"
                                startIcon={<SearchIcon />}
                                sx={{ py: 1.5 }}
                            >
                                {t('player.search_button')}
                            </Button>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>

            {/* Liste des joueurs */}
            {players && players.length > 0 && (
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        {t('players.results_count', { count: players.length })}
                    </Typography>

                    <Grid2 container spacing={3}>
                        {players.map((player) => (
                            <Grid2 size={{xs: 12, sm: 6, md: 4}} key={player.Id}>
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
                                    onClick={() => navigate(`/player/${player.Id}`)}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                        {player.AllianceName && (
                                            <Chip 
                                                label={player.AllianceName} 
                                                size="small" 
                                                sx={{ mb: 1 }}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                        <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                                            {player.Name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid2>
                        ))}
                    </Grid2>
                </Box>
            )}
        </Container>
    );
};

export default Players;  // Le nom du composant doit aussi être en majuscule ici
