import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Card, CardContent, Grid2, Button, Slider,
    FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
    TextField, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, CircularProgress, Alert, Tooltip, Divider,
    InputAdornment, ToggleButtonGroup, ToggleButton, IconButton, LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import TerrainIcon from '@mui/icons-material/Terrain';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import api from '../../api';

// ─── Constants (same logic as Craft.jsx) ────────────────────────────────────

const CITIES = ['Caerleon', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Brecilien'];

const REFINING_SPECIALTY = {
    'Fort Sterling': 'wood',
    'Lymhurst':      'fiber',
    'Martlock':      'hide',
    'Bridgewatch':   'stone',
    'Thetford':      'metal',
};

const CRAFTING_SPECIALTY = {
    'Fort Sterling': ['hammer', 'spear', 'holy', 'plate_helmet', 'cloth_chest'],
    'Lymhurst':      ['sword', 'bow', 'arcane', 'leather_helmet', 'leather_shoes'],
    'Bridgewatch':   ['crossbow', 'dagger', 'curse', 'plate_chest', 'cloth_shoes'],
    'Martlock':      ['axe', 'quarterstaff', 'frost', 'plate_boots', 'offhand'],
    'Thetford':      ['mace', 'fire', 'nature', 'leather_chest', 'cloth_helmet'],
    'Caerleon':      ['war_gloves', 'shapeshifter', 'food', 'stew', 'omelette', 'tools'],
    'Brecilien':     ['cape', 'bag', 'potion'],
};

const CATEGORY_LABELS   = { weapons: 'Armes', armor: 'Armures', food: 'Nourriture', refinement: 'Raffinage', other: 'Autre' };
const SUBCATEGORY_LABELS = {
    sword: 'Épée', bow: 'Arc', axe: 'Hache', spear: 'Lance', crossbow: 'Arbalète',
    plate_chest: 'Plastron', leather_chest: 'Armure cuir', cloth_chest: 'Robe',
    plate_helmet: 'Casque lourd', leather_helmet: 'Casque cuir', cloth_helmet: 'Chapeau',
    plate_boots: 'Bottes lourdes', leather_shoes: 'Chaussures cuir', cloth_shoes: 'Chaussures tissu',
    wood: 'Bois', metal: 'Métal', hide: 'Peau', fiber: 'Fibre', stone: 'Pierre',
    stew: 'Ragoût', omelette: 'Omelette',
};
const CATEGORY_SPEC_MAP = { weapons: 'weapons', armor: 'armor', food: 'food', refinement: 'refinement' };
const SPEC_BRANCH_LABELS = { weapons: 'Armes', armor: 'Armures', food: 'Nourriture', refinement: 'Raffinage' };

const getCitySpecBonus = (locationType, city, recipe) => {
    if (locationType !== 'city') return 0;
    if (recipe.category === 'refinement') {
        return REFINING_SPECIALTY[city] === recipe.subcategory ? 40 : 0;
    }
    const bonusSubs = CRAFTING_SPECIALTY[city] || [];
    const sub = (recipe.subcategory || '').toLowerCase();
    const un  = (recipe.uniqueName || '').toLowerCase();
    return bonusSubs.some(s => sub.includes(s) || un.includes(s.replace('_', ''))) ? 15 : 0;
};

const computeLPB = ({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus }) => {
    let baseLPB;
    if (locationType === 'hideout') {
        const rr = Math.max(0, Math.min(0.99, hoBaseReturn / 100));
        baseLPB = rr > 0 ? (rr / (1 - rr)) * 100 : 0;
    } else if (locationType === 'island') {
        baseLPB = 0;
    } else {
        baseLPB = 18;
    }
    return baseLPB + citySpecBonus + (dailyBonus || 0) + (useFocus ? 59 : 0);
};

// Focus cost reduction: halved every 10 000 efficiency pts, max 40 000 → ×0.0625
const focusCostMultiplier = (spec) => 1 / Math.pow(2, (spec / 100) * 4);

const rrFromLPB = (lpb) => lpb / (100 + lpb);

const fmt = n => {
    if (!n && n !== 0) return '—';
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return Math.round(n).toLocaleString('fr-FR');
};

const profitColor = p => (p > 0 ? '#4ade80' : p < 0 ? '#f87171' : 'inherit');

// ─── Sub-components ──────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, sub, color, large }) => (
    <Card sx={{ border: '1px solid rgba(201,168,76,0.15)', height: '100%' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant={large ? 'h5' : 'h6'} fontWeight={700} sx={{ color: color || 'text.primary', mt: 0.5 }}>
                {value}
            </Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </CardContent>
    </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CraftDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Settings
    const [locationType, setLocationType] = useState('city');
    const [city, setCity]                 = useState('Caerleon');
    const [hoBaseReturn, setHoBaseReturn] = useState(26);
    const [premium, setPremium]           = useState(false);
    const [useFocus, setUseFocus]         = useState(false);
    const [dailyBonus, setDailyBonus]     = useState(0);
    const [specializations, setSpecializations] = useState({ weapons: 0, armor: 0, food: 0, refinement: 0 });
    const [quantity, setQuantity]         = useState(1);

    // Data
    const [recipe, setRecipe]           = useState(null);
    const [marketData, setMarketData]   = useState({});
    const [loadingRecipe, setLoadingRecipe] = useState(true);
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [error, setError]             = useState('');
    const [lastRefresh, setLastRefresh] = useState(null);

    // Load user prefs
    useEffect(() => {
        api.get('/profile/preferences').then(r => {
            const p = r.data;
            if (p.city) setCity(p.city);
            if (p.locationType) setLocationType(p.locationType);
            if (p.hoBaseReturn !== undefined) setHoBaseReturn(p.hoBaseReturn);
            if (typeof p.premium === 'boolean') setPremium(p.premium);
            if (typeof p.useFocus === 'boolean') setUseFocus(p.useFocus);
            if (p.dailyBonus !== undefined) setDailyBonus(p.dailyBonus);
            if (p.specializations) setSpecializations(prev => ({ ...prev, ...p.specializations }));
        }).catch(() => {});
    }, []);

    // Load recipe
    useEffect(() => {
        setLoadingRecipe(true);
        api.get(`/crafting/recipes/${id}`)
            .then(r => setRecipe(r.data))
            .catch(() => setError('Recette introuvable'))
            .finally(() => setLoadingRecipe(false));
    }, [id]);

    // Load prices when recipe is available
    const fetchPrices = useCallback(async (r) => {
        if (!r) return;
        const items = [r.uniqueName, ...r.ingredients.map(i => i.uniqueName)];
        setLoadingPrices(true);
        setError('');
        try {
            const res = await api.post('/items/market/batch', { items, quality: 1 });
            setMarketData(res.data);
            setLastRefresh(new Date());
        } catch {
            setError('Erreur lors du chargement des prix marché.');
        } finally {
            setLoadingPrices(false);
        }
    }, []);

    useEffect(() => {
        if (recipe) fetchPrices(recipe);
    }, [recipe, fetchPrices]);

    // ── Calculations ──────────────────────────────────────────────────────────
    const calcData = (() => {
        if (!recipe) return null;

        const specBranch   = CATEGORY_SPEC_MAP[recipe.category] || 'weapons';
        const spec         = specializations[specBranch] ?? 0;
        const citySpecBonus = getCitySpecBonus(locationType, city, recipe);
        const lpb          = computeLPB({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus });
        const lpbNoFocus   = computeLPB({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus: false });
        const returnRate   = rrFromLPB(lpb);
        const tax          = premium ? 0.065 : 0.105;

        const ingredientDetails = recipe.ingredients.map(ing => {
            const priceEntry = (marketData[ing.uniqueName]?.prices || []).find(p => p.city === city);
            const unitPrice  = priceEntry?.sell_price_min || 0;
            const total      = unitPrice * ing.amount * quantity;
            const saved      = total * returnRate;
            return { ...ing, unitPrice, total, saved, hasPrices: unitPrice > 0 };
        });

        const materialCost  = ingredientDetails.reduce((s, i) => s + i.total, 0);
        const totalSaved    = materialCost * returnRate;
        const effectiveCost = materialCost - totalSaved;

        const outEntry      = (marketData[recipe.uniqueName]?.prices || []).find(p => p.city === city);
        const sellPriceUnit = outEntry?.sell_price_min || 0;
        const grossRevenue  = sellPriceUnit * recipe.outputAmount * quantity;
        const netRevenue    = grossRevenue * (1 - tax);
        const profit        = netRevenue - effectiveCost;
        const focusCost     = useFocus ? Math.round(recipe.focusCostBase * focusCostMultiplier(spec) * quantity) : 0;
        const spf           = focusCost > 0 && profit !== 0 ? profit / focusCost : null;
        const margin        = materialCost > 0 && sellPriceUnit > 0
            ? ((profit / materialCost) * 100).toFixed(1) : null;

        return {
            lpb, lpbNoFocus, returnRate, citySpecBonus, spec,
            ingredientDetails, materialCost, totalSaved, effectiveCost,
            sellPriceUnit, grossRevenue, netRevenue, tax, profit,
            focusCost, spf, margin,
            allPrices: ingredientDetails.every(i => i.hasPrices) && sellPriceUnit > 0,
        };
    })();

    // ── Render ────────────────────────────────────────────────────────────────

    if (loadingRecipe) {
        return (
            <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#c9a84c' }} />
            </Container>
        );
    }

    if (!recipe) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Recette introuvable'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/craft')} sx={{ mt: 2 }}>
                    Retour au Craft
                </Button>
            </Container>
        );
    }

    const specBranch = CATEGORY_SPEC_MAP[recipe.category] || 'weapons';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* ── Back button ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/craft')}
                sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: '#c9a84c' } }}
            >
                Retour au Craft
            </Button>

            {/* ── Recipe header ── */}
            <Card sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.04)' }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box
                        component="img"
                        src={`https://render.albiononline.com/v1/item/${recipe.uniqueName}.png`}
                        alt={recipe.name || recipe.uniqueName}
                        sx={{ width: 72, height: 72, imageRendering: 'pixelated', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', mb: 0.5 }}>
                            {recipe.name || recipe.uniqueName}
                        </Typography>
                        {recipe.name && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.8 }}>
                                {recipe.uniqueName}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                            <Chip label={`T${recipe.tier}`} color="primary" size="small" />
                            <Chip label={CATEGORY_LABELS[recipe.category] || recipe.category} size="small" />
                            {recipe.subcategory && (
                                <Chip label={SUBCATEGORY_LABELS[recipe.subcategory] || recipe.subcategory}
                                    variant="outlined" size="small" />
                            )}
                            {recipe.bonusCity && (
                                <Chip
                                    label={`Bonus +${recipe.category === 'refinement' ? 40 : 15}% LPB à ${recipe.bonusCity}`}
                                    color="success" size="small" variant="outlined"
                                />
                            )}
                            {recipe.outputAmount > 1 && (
                                <Chip label={`×${recipe.outputAmount} par craft`} size="small" color="secondary" />
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <IconButton
                            onClick={() => fetchPrices(recipe)}
                            disabled={loadingPrices}
                            sx={{ color: '#c9a84c' }}
                            title="Actualiser les prix"
                        >
                            <RefreshIcon />
                        </IconButton>
                        {lastRefresh && (
                            <Typography variant="caption" color="text.disabled">
                                Maj {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
                {loadingPrices && <LinearProgress sx={{ height: 2 }} color="warning" />}
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid2 container spacing={3}>

                {/* ── Left column: Settings ── */}
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <Card sx={{ border: '1px solid rgba(201,168,76,0.2)', position: 'sticky', top: 80 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', mb: 2 }}>
                                Paramètres
                            </Typography>

                            {/* Location */}
                            <Typography variant="caption" color="text.secondary">Lieu de craft</Typography>
                            <ToggleButtonGroup
                                value={locationType} exclusive size="small" fullWidth
                                onChange={(_, v) => { if (v) setLocationType(v); }}
                                sx={{ mt: 0.5, mb: 2 }}
                            >
                                <ToggleButton value="city" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <LocationCityIcon sx={{ fontSize: 14 }} /> Ville
                                </ToggleButton>
                                <ToggleButton value="hideout" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <HomeIcon sx={{ fontSize: 14 }} /> HO
                                </ToggleButton>
                                <ToggleButton value="island" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <TerrainIcon sx={{ fontSize: 14 }} /> Île
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {locationType === 'city' && (
                                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                    <InputLabel>Ville</InputLabel>
                                    <Select value={city} label="Ville"
                                        onChange={e => { setCity(e.target.value); fetchPrices(recipe); }}>
                                        {CITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}

                            {locationType === 'hideout' && (
                                <TextField
                                    label="% retour sans focus (HO)" type="number" size="small" fullWidth
                                    value={hoBaseReturn}
                                    onChange={e => setHoBaseReturn(Math.max(0, Math.min(80, Number(e.target.value))))}
                                    helperText="Affiché in-game avant focus"
                                    sx={{ mb: 2 }}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                            )}

                            {locationType === 'island' && (
                                <Alert severity="info" sx={{ py: 0.5, mb: 2, fontSize: 12 }}>
                                    Île : LPB base = 0%
                                </Alert>
                            )}

                            <Divider sx={{ mb: 2 }} />

                            {/* Toggles */}
                            <FormControlLabel
                                control={<Switch checked={premium} onChange={e => setPremium(e.target.checked)} size="small" color="warning" />}
                                label={
                                    <Typography variant="body2" component="span">
                                        Premium{' '}
                                        <Chip label={premium ? '6.5%' : '10.5%'} size="small"
                                            color={premium ? 'success' : 'default'}
                                            sx={{ height: 16, fontSize: 10 }} />
                                    </Typography>
                                }
                                sx={{ display: 'flex', mb: 1 }}
                            />
                            <FormControlLabel
                                control={<Switch checked={useFocus} onChange={e => setUseFocus(e.target.checked)} size="small" color="info" />}
                                label={
                                    <Typography variant="body2" component="span">
                                        Focus{' '}
                                        <Chip label="+59% LPB" size="small"
                                            color={useFocus ? 'info' : 'default'}
                                            sx={{ height: 16, fontSize: 10 }} />
                                    </Typography>
                                }
                                sx={{ display: 'flex', mb: 1.5 }}
                            />

                            {/* Daily bonus */}
                            <TextField
                                label="Bonus journalier" type="number" size="small" fullWidth
                                value={dailyBonus}
                                onChange={e => setDailyBonus(Math.max(0, Math.min(20, Number(e.target.value))))}
                                helperText="0–20% LPB"
                                sx={{ mb: 2 }}
                                slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                            />

                            {/* Quantity */}
                            <TextField
                                label="Quantité" type="number" size="small" fullWidth
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
                                sx={{ mb: 2 }}
                            />

                            <Divider sx={{ mb: 2 }} />

                            {/* Spec slider for this category */}
                            <Typography variant="caption" color="text.secondary">
                                Maîtrise {SPEC_BRANCH_LABELS[specBranch]} (Destiny Board)
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2">{SPEC_BRANCH_LABELS[specBranch]}</Typography>
                                <Typography variant="body2" color="primary">{specializations[specBranch]}</Typography>
                            </Box>
                            <Slider
                                size="small"
                                value={specializations[specBranch] ?? 0}
                                min={0} max={100} step={1}
                                onChange={(_, v) => setSpecializations(prev => ({ ...prev, [specBranch]: v }))}
                                sx={{ color: '#c9a84c', mb: 0.5 }}
                            />
                            {calcData && (
                                <Typography variant="caption" color="text.secondary">
                                    Coût focus : <span style={{ color: '#60a5fa' }}>
                                        {(focusCostMultiplier(specializations[specBranch] ?? 0) * 100).toFixed(1)}% du base
                                    </span>
                                    <br />
                                    Retour : {(calcData.returnRate * 100).toFixed(2)}%
                                    {useFocus && <span style={{ color: '#60a5fa' }}> (focus)</span>}
                                    {' / '}sans focus : {(rrFromLPB(calcData.lpbNoFocus) * 100).toFixed(2)}%
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>

                {/* ── Right column: Details ── */}
                <Grid2 size={{ xs: 12, md: 8 }}>

                    {/* ── LPB / Return summary ── */}
                    {calcData && (
                        <Box sx={{ mb: 3 }}>
                            <Grid2 container spacing={1.5}>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard label="LPB total" value={`${calcData.lpb.toFixed(0)}%`}
                                        sub={calcData.citySpecBonus > 0 ? `+${calcData.citySpecBonus}% spécialité ville` : null}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard label="Taux de retour" value={`${(calcData.returnRate * 100).toFixed(2)}%`}
                                        sub="RR = LPB / (100 + LPB)"
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard label="Taxe marché" value={`${(calcData.tax * 100).toFixed(1)}%`}
                                        sub={premium ? 'Premium' : 'Non-premium'}
                                        color={premium ? '#4ade80' : '#f87171'}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard
                                        label={useFocus ? 'Focus consommé' : 'Focus (inactif)'}
                                        value={useFocus ? `${fmt(calcData.focusCost)} F` : '—'}
                                        sub={useFocus && recipe.focusCostBase ? `${fmt(recipe.focusCostBase)} / craft` : null}
                                        color={useFocus ? '#60a5fa' : 'text.disabled'}
                                    />
                                </Grid2>
                            </Grid2>
                        </Box>
                    )}

                    {/* ── Ingredients table ── */}
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Cinzel, serif', mb: 1.5, color: '#c9a84c' }}>
                        Ingrédients
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.15)' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(201,168,76,0.07)' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Qté</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Prix unitaire</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Sous-total</TableCell>
                                    {calcData && useFocus && (
                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#60a5fa' }}>Retourné</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(calcData?.ingredientDetails || recipe.ingredients).map((ing) => (
                                    <TableRow key={ing.uniqueName}
                                        sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    component="img"
                                                    src={`https://render.albiononline.com/v1/item/${ing.uniqueName}.png`}
                                                    alt={ing.uniqueName}
                                                    sx={{ width: 36, height: 36, imageRendering: 'pixelated', flexShrink: 0 }}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{ing.uniqueName}</Typography>
                                                    {ing.hasPrices === false && (
                                                        <Typography variant="caption" color="warning.main">
                                                            Prix non disponible
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {ing.amount}{quantity > 1 && ` × ${quantity}`}
                                            </Typography>
                                            {quantity > 1 && (
                                                <Typography variant="caption" color="text.disabled">
                                                    = {ing.amount * quantity}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {ing.unitPrice > 0 ? `${fmt(ing.unitPrice)} Ag` : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                {ing.total > 0 ? `${fmt(ing.total)} Ag` : '—'}
                                            </Typography>
                                        </TableCell>
                                        {calcData && useFocus && (
                                            <TableCell align="right" sx={{ color: '#60a5fa' }}>
                                                <Typography variant="body2">
                                                    {ing.saved > 0 ? `+${fmt(ing.saved)} Ag` : '—'}
                                                </Typography>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}

                                {/* Totals row */}
                                {calcData && (
                                    <>
                                        <TableRow sx={{ bgcolor: 'rgba(201,168,76,0.04)', borderTop: '2px solid rgba(201,168,76,0.2)' }}>
                                            <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Coût total matières</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {fmt(calcData.materialCost)} Ag
                                            </TableCell>
                                            {useFocus && <TableCell />}
                                        </TableRow>
                                        {useFocus && (
                                            <TableRow sx={{ bgcolor: 'rgba(96,165,250,0.04)' }}>
                                                <TableCell colSpan={3} sx={{ color: '#60a5fa' }}>
                                                    Retour focus ({(calcData.returnRate * 100).toFixed(2)}% · LPB {calcData.lpb.toFixed(0)}%)
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: '#60a5fa' }}>
                                                    −{fmt(calcData.totalSaved)} Ag
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: '#60a5fa' }}>
                                                    +{fmt(calcData.totalSaved)} Ag
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow sx={{ bgcolor: 'rgba(201,168,76,0.06)' }}>
                                            <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Coût effectif</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#c9a84c' }}>
                                                {fmt(calcData.effectiveCost)} Ag
                                            </TableCell>
                                            {useFocus && <TableCell />}
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* ── Output item + P&L ── */}
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Cinzel, serif', mb: 1.5, color: '#c9a84c' }}>
                        Résultat de craft
                    </Typography>
                    <Card sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.2)' }}>
                        <CardContent sx={{ p: 0 }}>
                            {/* Output item row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <Box
                                    component="img"
                                    src={`https://render.albiononline.com/v1/item/${recipe.uniqueName}.png`}
                                    alt={recipe.name || recipe.uniqueName}
                                    sx={{ width: 48, height: 48, imageRendering: 'pixelated' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" fontWeight={700}>
                                        {recipe.name || recipe.uniqueName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {recipe.outputAmount > 1 ? `Produit ×${recipe.outputAmount}` : 'Produit ×1'}{quantity > 1 ? ` · Quantité ×${quantity}` : ''}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">Prix de vente</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#c9a84c' }}>
                                        {calcData?.sellPriceUnit > 0 ? `${fmt(calcData.sellPriceUnit)} Ag` : 'N/A'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.5 }}>
                                        <StorefrontIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.3 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {city}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* P&L breakdown */}
                            {calcData && (
                                <Box sx={{ p: 2 }}>
                                    {[
                                        { label: 'Revenu brut', value: fmt(calcData.grossRevenue), color: '#c9a84c', sub: `${recipe.outputAmount * quantity} × ${fmt(calcData.sellPriceUnit)} Ag` },
                                        { label: `Taxe marché (−${(calcData.tax * 100).toFixed(1)}%)`, value: `−${fmt(calcData.grossRevenue * calcData.tax)}`, color: '#f87171', sub: premium ? 'Premium : 6.5%' : 'Non-premium : 10.5%' },
                                        { label: 'Revenu net', value: fmt(calcData.netRevenue), color: '#c9a84c', bold: true, divider: true },
                                        { label: 'Coût effectif matières', value: `−${fmt(calcData.effectiveCost)}`, color: '#f87171', sub: useFocus ? `après retour ${(calcData.returnRate * 100).toFixed(2)}%` : 'Sans focus' },
                                    ].map(row => (
                                        <React.Fragment key={row.label}>
                                            {row.divider && <Divider sx={{ my: 1.5 }} />}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={row.bold ? 700 : 400}>{row.label}</Typography>
                                                    {row.sub && <Typography variant="caption" color="text.disabled">{row.sub}</Typography>}
                                                </Box>
                                                <Typography variant="body2" fontWeight={row.bold ? 700 : 400} sx={{ color: row.color }}>
                                                    {row.value} Ag
                                                </Typography>
                                            </Box>
                                        </React.Fragment>
                                    ))}

                                    {/* Final profit */}
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 1, bgcolor: calcData.profit > 0 ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${calcData.profit > 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {calcData.profit > 0
                                                ? <TrendingUpIcon sx={{ color: '#4ade80' }} />
                                                : <TrendingDownIcon sx={{ color: '#f87171' }} />
                                            }
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}
                                                    sx={{ color: profitColor(calcData.profit) }}>
                                                    Bénéfice net
                                                </Typography>
                                                {calcData.margin && (
                                                    <Typography variant="caption" sx={{ color: profitColor(calcData.profit) }}>
                                                        {calcData.margin}% marge
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="h5" fontWeight={700}
                                            sx={{ color: profitColor(calcData.profit) }}>
                                            {calcData.sellPriceUnit > 0 ? `${calcData.profit >= 0 ? '+' : ''}${fmt(calcData.profit)} Ag` : '—'}
                                        </Typography>
                                    </Box>

                                    {/* SPF */}
                                    {useFocus && calcData.spf !== null && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <FlashOnIcon sx={{ color: '#60a5fa' }} />
                                                <Box>
                                                    <Typography variant="body1" fontWeight={700} sx={{ color: '#60a5fa' }}>
                                                        SPF (Silver par Focus)
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {fmt(calcData.focusCost)} focus consommé
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="h6" fontWeight={700}
                                                sx={{ color: calcData.spf > 0 ? '#60a5fa' : '#f87171' }}>
                                                {fmt(calcData.spf)} Ag/F
                                            </Typography>
                                        </Box>
                                    )}

                                    {!calcData.allPrices && (
                                        <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, fontSize: 12 }}>
                                            Prix incomplets — certains items n'ont pas de cotation sur ce marché.
                                        </Alert>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Container>
    );
};

export default CraftDetail;
