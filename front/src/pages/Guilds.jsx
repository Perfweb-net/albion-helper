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

const Guilds = () => {  // Le nom du composant commence par une majuscule
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
                    Guilds
                </Typography>

                <Grid2 container spacing={2} sx={{width: '100%', alignItems: 'center', marginBottom: 2}}>
                    <Grid2 size={12}>
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

                {guilds && guilds.length > 0 && (
                    <Box sx={{marginTop: 4, width: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Guild List:
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
            </Box>
        </Container>
    );
};

export default Guilds;  // Le nom du composant doit aussi être en majuscule ici
