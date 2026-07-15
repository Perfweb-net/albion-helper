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
    CardContent
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import { useTranslation } from 'react-i18next';
import './Guilds.scss';

const Guilds = () => {  // Le nom du composant commence par une majuscule
    const { t } = useTranslation();
    const [pseudo, setPseudo] = useState('');
    const [guilds, setGuilds] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        await api.get("/player/search?pseudo=" + pseudo).then(
            (response) => {
                setGuilds(response.data.guilds);
            }
        ).catch((error) => console.error('Error fetching player:', error));
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} gutterBottom className="ah-page-title ah-page-title--center">
                    {t('guilds.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('guilds.subtitle')}
                </Typography>
            </Box>

            <Card sx={{ mb: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                        <Grid2 size={{xs: 12, md: 10}}>
                            <TextField
                                label={t('guilds.search_label')}
                                variant="outlined"
                                fullWidth
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit();
                                    }
                                }}
                                placeholder={t('guilds.search_placeholder')}
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
                                {t('common.search')}
                            </Button>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>

            {guilds && guilds.length > 0 && (
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        {t('guilds.results_count', { count: guilds.length })}
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
        </Container>
    );
};

export default Guilds;  // Le nom du composant doit aussi être en majuscule ici
