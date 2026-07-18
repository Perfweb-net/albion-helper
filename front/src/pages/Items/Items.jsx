import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Container,
    Grid2,
    TextField,
    Typography,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Paper,
    CircularProgress,
    Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import { getItemPrices } from '../../api/albionDataApi';
import api from '../../api';
import ItemMarketModal from './ItemMarketModal';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import './Items.scss';

const LANG_MAP = { fr: 'FR-FR', en: 'EN-US', de: 'DE-DE', es: 'ES-ES', pt: 'PT-BR', ru: 'RU-RU', it: 'IT-IT', pl: 'PL-PL', zh: 'ZH-CN', ko: 'KO-KR', ja: 'JA-JP', tr: 'TR-TR' };

const getLocalizedName = (item, lang) => {
    const key = LANG_MAP[lang] || 'EN-US';
    return item.LocalizedNames?.[key] || item.LocalizedNames?.['EN-US'] || item.UniqueName || '';
};

const Items = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'en';
    const [selectedTier, setSelectedTier] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dbEmpty, setDbEmpty] = useState(false);
    const [itemPrices, setItemPrices] = useState({});
    const [loadingPrices, setLoadingPrices] = useState({});

    // Vérifie si la BDD a des items au montage
    useEffect(() => {
        api.get('/items/count').then(r => setDbEmpty(r.data.count === 0)).catch(() => {});
    }, []);

    const handleSearch = async (term) => {
        if (!term && !selectedTier) return;
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ lang });
            if (term) params.set('q', term);
            if (selectedTier) params.set('tier', selectedTier);
            const res = await api.get(`/items/search?${params}`);
            setFilteredItems(res.data);
        } catch {
            setError(t('items.search_error'));
        } finally {
            setLoading(false);
        }
    };

    const { query: searchTerm, setQuery: setSearchTerm, triggerSearch } = useDebouncedSearch(handleSearch);

    const handleGetPrices = async (itemId) => {
        if (itemPrices[itemId]) {
            return; // Déjà chargé
        }

        setLoadingPrices(prev => ({ ...prev, [itemId]: true }));
        try {
            const prices = await getItemPrices(itemId, 'Caerleon', selectedQuality || '');
            setItemPrices(prev => ({ ...prev, [itemId]: prices }));
        } catch (err) {
            console.error('Error fetching prices:', err);
            setItemPrices(prev => ({ ...prev, [itemId]: null }));
        } finally {
            setLoadingPrices(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const getItemTier = (uniqueName) => {
        const match = uniqueName?.match(/T(\d)/);
        return match ? match[1] : '?';
    };

    const getItemQuality = (uniqueName) => {
        const match = uniqueName?.match(/@(\d)/);
        return match ? match[1] : '0';
    };

    const getQualityColor = (quality) => {
        const colors = {
            '0': 'default',
            '1': 'success',
            '2': 'info',
            '3': 'warning',
            '4': 'error',
            '5': 'secondary'
        };
        return colors[quality] || 'default';
    };

    const getQualityLabel = (quality) => {
        const keys = {
            '0': 'items.quality_normal',
            '1': 'items.quality_good',
            '2': 'items.quality_outstanding',
            '3': 'items.quality_excellent',
            '4': 'items.quality_masterpiece',
            '5': 'items.quality_artifact'
        };
        return t(keys[quality] || 'items.quality_unknown');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} gutterBottom className="ah-page-title ah-page-title--center">
                    {t('items.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('items.subtitle')}
                </Typography>
            </Box>

            <Card sx={{ mb: 4, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid2 container spacing={3} sx={{ alignItems: 'center' }}>
                        <Grid2 size={{xs: 12, md: 5}}>
                            <TextField
                                label={t('items.item_name_label')}
                                variant="outlined"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        triggerSearch();
                                    }
                                }}
                                placeholder={t('items.item_name_placeholder')}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 3}}>
                            <FormControl fullWidth>
                                <InputLabel>{t('items.tier_label')}</InputLabel>
                                <Select
                                    value={selectedTier}
                                    onChange={(e) => setSelectedTier(e.target.value)}
                                    label={t('items.tier_label')}
                                >
                                    <MenuItem value="">{t('items.tier_all')}</MenuItem>
                                    <MenuItem value="4">T4</MenuItem>
                                    <MenuItem value="5">T5</MenuItem>
                                    <MenuItem value="6">T6</MenuItem>
                                    <MenuItem value="7">T7</MenuItem>
                                    <MenuItem value="8">T8</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 2}}>
                            <FormControl fullWidth>
                                <InputLabel>{t('items.quality_label')}</InputLabel>
                                <Select
                                    value={selectedQuality}
                                    onChange={(e) => setSelectedQuality(e.target.value)}
                                    label={t('items.quality_label')}
                                >
                                    <MenuItem value="">{t('items.quality_all')}</MenuItem>
                                    <MenuItem value="1">{t('items.quality_good')}</MenuItem>
                                    <MenuItem value="2">{t('items.quality_outstanding')}</MenuItem>
                                    <MenuItem value="3">{t('items.quality_excellent')}</MenuItem>
                                    <MenuItem value="4">{t('items.quality_masterpiece')}</MenuItem>
                                    <MenuItem value="5">{t('items.quality_artifact')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{xs: 12, md: 2}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={triggerSearch}
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

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {dbEmpty && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {t('items.db_empty_message')} <strong>{t('nav.admin')}</strong> {t('items.db_empty_sync')}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!loading && filteredItems.length > 0 && (
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        {t('items.results_count', { count: filteredItems.length })}
                    </Typography>

                    <Grid2 container spacing={3}>
                        {filteredItems.map((item, index) => {
                            const uniqueName = item.UniqueName || item.uniqueName || '';
                            const itemName = getLocalizedName(item, lang);
                            const tier = getItemTier(uniqueName);
                            const quality = getItemQuality(uniqueName);
                            const prices = itemPrices[uniqueName];
                            const iconUrl = `https://render.albiononline.com/v1/item/${uniqueName}.png`;

                            return (
                                <Grid2 size={{xs: 12, sm: 6, md: 4}} key={uniqueName || index}>
                                    <Card sx={{ height: '100%', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    component="img"
                                                    src={iconUrl}
                                                    alt={itemName}
                                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                    sx={{ width: 52, height: 52, flexShrink: 0, imageRendering: 'pixelated' }}
                                                />
                                                <InventoryIcon sx={{ color: 'primary.main', display: 'none', flexShrink: 0 }} />
                                                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                                                    {itemName}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                <Chip 
                                                    label={`T${tier}`} 
                                                    size="small" 
                                                    color="primary"
                                                />
                                                {quality !== '0' && (
                                                    <Chip 
                                                        label={getQualityLabel(quality)} 
                                                        size="small" 
                                                        color={getQualityColor(quality)}
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace', fontSize: 11 }}>
                                                {uniqueName}
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                fullWidth
                                                onClick={() => setSelectedItem({ uniqueName, name: itemName, iconUrl })}
                                            >
                                                {t('items.view_prices_btn')}
                                            </Button>

                                        </CardContent>
                                    </Card>
                                </Grid2>
                            );
                        })}
                    </Grid2>
                </Box>
            )}

            {!loading && !error && filteredItems.length === 0 && (searchTerm || selectedTier) && (
                <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            {t('items.no_results')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('items.no_results_hint')}
                        </Typography>
                    </CardContent>
                </Card>
            )}
            {selectedItem && (
                <ItemMarketModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </Container>
    );
};

export default Items;

