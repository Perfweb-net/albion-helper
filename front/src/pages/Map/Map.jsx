import React, {useCallback, useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import MapCard from '../../components/map/MapCard';
import MapLegend from '../../components/map/MapLegend';

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
                                {mapsFitered.map((map) => (
                                    <Grid2 size={{xs: 12, sm: 6, md: 4}} key={map.name}>
                                        <MapCard map={map} showChestInfo={showChestInfo} showGatherInfo={showGatherInfo} />
                                    </Grid2>
                                ))}
                            </Grid2>
                        </Box>
                    )}

                <MapLegend maps={mapsFitered} showChestInfo={showChestInfo} showGatherInfo={showGatherInfo} />
            </Container>
        </>
    );
};

export default Map;
