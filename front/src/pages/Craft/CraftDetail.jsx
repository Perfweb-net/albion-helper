import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Internal keys — labels rendered via t() at display time
const CATEGORY_KEYS   = {
    weapons: 'craft.category.weapons',
    armor: 'craft.category.armor',
    food: 'craft.category.food',
    refinement: 'craft.category.refinement',
    other: 'craft.category.other',
};
const SUBCATEGORY_KEYS = {
    sword: 'craft.subcategory.sword', bow: 'craft.subcategory.bow', axe: 'craft.subcategory.axe',
    spear: 'craft.subcategory.spear', crossbow: 'craft.subcategory.crossbow',
    plate_chest: 'craft.subcategory.plate_chest', leather_chest: 'craft.subcategory.leather_chest',
    cloth_chest: 'craft.subcategory.cloth_chest',
    plate_helmet: 'craft.subcategory.plate_helmet', leather_helmet: 'craft.subcategory.leather_helmet',
    cloth_helmet: 'craft.subcategory.cloth_helmet',
    plate_boots: 'craft.subcategory.plate_boots', leather_shoes: 'craft.subcategory.leather_shoes',
    cloth_shoes: 'craft.subcategory.cloth_shoes',
    wood: 'craft.subcategory.wood', metal: 'craft.subcategory.metal', hide: 'craft.subcategory.hide',
    fiber: 'craft.subcategory.fiber', stone: 'craft.subcategory.stone',
    stew: 'craft.subcategory.stew', omelette: 'craft.subcategory.omelette',
};
const CATEGORY_SPEC_MAP = { weapons: 'weapons', armor: 'armor', food: 'food', refinement: 'refinement' };
const SPEC_BRANCH_KEYS = {
    weapons: 'craft.spec_group.weapons',
    armor: 'craft.spec_group.armor',
    food: 'craft.spec_group.food',
    refinement: 'craft.spec_group.refining',
};

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
    const { t } = useTranslation();

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
            .catch(() => setError(t('craft.detail.recipe_not_found')))
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
            setError(t('craft.error.load_prices'));
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
                <Alert severity="error">{error || t('craft.detail.recipe_not_found')}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/craft')} sx={{ mt: 2 }}>
                    {t('craft.detail.back')}
                </Button>
            </Container>
        );
    }

    const specBranch = CATEGORY_SPEC_MAP[recipe.category] || 'weapons';
    const specBranchLabel = t(SPEC_BRANCH_KEYS[specBranch] || specBranch);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* ── Back button ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/craft')}
                sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: '#c9a84c' } }}
            >
                {t('craft.detail.back')}
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
                            <Chip label={t(CATEGORY_KEYS[recipe.category] || recipe.category)} size="small" />
                            {recipe.subcategory && (
                                <Chip label={t(SUBCATEGORY_KEYS[recipe.subcategory] || recipe.subcategory)}
                                    variant="outlined" size="small" />
                            )}
                            {recipe.bonusCity && (
                                <Chip
                                    label={t('craft.detail.bonus_city_chip', {
                                        bonus: recipe.category === 'refinement' ? 40 : 15,
                                        city: recipe.bonusCity,
                                    })}
                                    color="success" size="small" variant="outlined"
                                />
                            )}
                            {recipe.outputAmount > 1 && (
                                <Chip label={t('craft.detail.output_amount', { amount: recipe.outputAmount })} size="small" color="secondary" />
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <IconButton
                            onClick={() => fetchPrices(recipe)}
                            disabled={loadingPrices}
                            sx={{ color: '#c9a84c' }}
                            title={t('craft.refresh_prices')}
                        >
                            <RefreshIcon />
                        </IconButton>
                        {lastRefresh && (
                            <Typography variant="caption" color="text.disabled">
                                {t('craft.detail.last_refresh', {
                                    time: lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                                })}
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
                                {t('craft.settings')}
                            </Typography>

                            {/* Location */}
                            <Typography variant="caption" color="text.secondary">{t('craft.location.label')}</Typography>
                            <ToggleButtonGroup
                                value={locationType} exclusive size="small" fullWidth
                                onChange={(_, v) => { if (v) setLocationType(v); }}
                                sx={{ mt: 0.5, mb: 2 }}
                            >
                                <ToggleButton value="city" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <LocationCityIcon sx={{ fontSize: 14 }} /> {t('craft.location.city_short')}
                                </ToggleButton>
                                <ToggleButton value="hideout" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <HomeIcon sx={{ fontSize: 14 }} /> HO
                                </ToggleButton>
                                <ToggleButton value="island" sx={{ fontSize: '0.7rem', gap: 0.5 }}>
                                    <TerrainIcon sx={{ fontSize: 14 }} /> {t('craft.location.island_short')}
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {locationType === 'city' && (
                                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                    <InputLabel>{t('craft.settings.city')}</InputLabel>
                                    <Select value={city} label={t('craft.settings.city')}
                                        onChange={e => { setCity(e.target.value); fetchPrices(recipe); }}>
                                        {CITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}

                            {locationType === 'hideout' && (
                                <TextField
                                    label={t('craft.settings.ho_return')} type="number" size="small" fullWidth
                                    value={hoBaseReturn}
                                    onChange={e => setHoBaseReturn(Math.max(0, Math.min(80, Number(e.target.value))))}
                                    helperText={t('craft.settings.ho_return_hint_short')}
                                    sx={{ mb: 2 }}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                            )}

                            {locationType === 'island' && (
                                <Alert severity="info" sx={{ py: 0.5, mb: 2, fontSize: 12 }}>
                                    {t('craft.location.island_info_short')}
                                </Alert>
                            )}

                            <Divider sx={{ mb: 2 }} />

                            {/* Toggles */}
                            <FormControlLabel
                                control={<Switch checked={premium} onChange={e => setPremium(e.target.checked)} size="small" color="warning" />}
                                label={
                                    <Typography variant="body2" component="span">
                                        {t('craft.settings.premium')}{' '}
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
                                        {t('craft.settings.focus')}{' '}
                                        <Chip label="+59% LPB" size="small"
                                            color={useFocus ? 'info' : 'default'}
                                            sx={{ height: 16, fontSize: 10 }} />
                                    </Typography>
                                }
                                sx={{ display: 'flex', mb: 1.5 }}
                            />

                            {/* Daily bonus */}
                            <TextField
                                label={t('craft.settings.daily_bonus')} type="number" size="small" fullWidth
                                value={dailyBonus}
                                onChange={e => setDailyBonus(Math.max(0, Math.min(20, Number(e.target.value))))}
                                helperText={t('craft.settings.daily_bonus_hint_short')}
                                sx={{ mb: 2 }}
                                slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                            />

                            {/* Quantity */}
                            <TextField
                                label={t('craft.settings.quantity')} type="number" size="small" fullWidth
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
                                sx={{ mb: 2 }}
                            />

                            <Divider sx={{ mb: 2 }} />

                            {/* Spec slider for this category */}
                            <Typography variant="caption" color="text.secondary">
                                {t('craft.detail.spec_label', { branch: specBranchLabel })}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2">{specBranchLabel}</Typography>
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
                                    {t('craft.detail.focus_cost_pct')}{' '}
                                    <span style={{ color: '#60a5fa' }}>
                                        {(focusCostMultiplier(specializations[specBranch] ?? 0) * 100).toFixed(1)}% {t('craft.detail.of_base')}
                                    </span>
                                    <br />
                                    {t('craft.detail.return_rate')} {(calcData.returnRate * 100).toFixed(2)}%
                                    {useFocus && <span style={{ color: '#60a5fa' }}> ({t('craft.settings.focus')})</span>}
                                    {' / '}{t('craft.detail.without_focus')} {(rrFromLPB(calcData.lpbNoFocus) * 100).toFixed(2)}%
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
                                    <SummaryCard label={t('craft.detail.lpb_total')} value={`${calcData.lpb.toFixed(0)}%`}
                                        sub={calcData.citySpecBonus > 0 ? t('craft.detail.city_spec_bonus', { bonus: calcData.citySpecBonus }) : null}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard label={t('craft.detail.return_rate_label')} value={`${(calcData.returnRate * 100).toFixed(2)}%`}
                                        sub={t('craft.detail.rr_formula')}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard label={t('craft.detail.market_tax')} value={`${(calcData.tax * 100).toFixed(1)}%`}
                                        sub={premium ? t('craft.settings.premium') : t('craft.detail.non_premium')}
                                        color={premium ? '#4ade80' : '#f87171'}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 6, sm: 3 }}>
                                    <SummaryCard
                                        label={useFocus ? t('craft.detail.focus_consumed') : t('craft.detail.focus_inactive')}
                                        value={useFocus ? `${fmt(calcData.focusCost)} F` : '—'}
                                        sub={useFocus && recipe.focusCostBase ? t('craft.detail.focus_per_craft', { amount: fmt(recipe.focusCostBase) }) : null}
                                        color={useFocus ? '#60a5fa' : 'text.disabled'}
                                    />
                                </Grid2>
                            </Grid2>
                        </Box>
                    )}

                    {/* ── Ingredients table ── */}
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Cinzel, serif', mb: 1.5, color: '#c9a84c' }}>
                        {t('craft.detail.ingredients')}
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.15)' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(201,168,76,0.07)' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>{t('craft.detail.ing_item')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t('craft.detail.ing_qty')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t('craft.detail.ing_unit_price')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t('craft.detail.ing_subtotal')}</TableCell>
                                    {calcData && useFocus && (
                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                                            {t('craft.detail.ing_returned')}
                                        </TableCell>
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
                                                            {t('craft.detail.price_unavailable')}
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
                                            <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{t('craft.detail.total_material_cost')}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {fmt(calcData.materialCost)} Ag
                                            </TableCell>
                                            {useFocus && <TableCell />}
                                        </TableRow>
                                        {useFocus && (
                                            <TableRow sx={{ bgcolor: 'rgba(96,165,250,0.04)' }}>
                                                <TableCell colSpan={3} sx={{ color: '#60a5fa' }}>
                                                    {t('craft.detail.focus_return_row', {
                                                        rr: (calcData.returnRate * 100).toFixed(2),
                                                        lpb: calcData.lpb.toFixed(0),
                                                    })}
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
                                            <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{t('craft.table.effective_cost')}</TableCell>
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
                        {t('craft.detail.craft_result')}
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
                                        {recipe.outputAmount > 1
                                            ? t('craft.detail.produced_multi', { amount: recipe.outputAmount })
                                            : t('craft.detail.produced_one')}
                                        {quantity > 1 ? ` · ${t('craft.detail.quantity_multi', { qty: quantity })}` : ''}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">{t('craft.detail.sell_price')}</Typography>
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
                                        {
                                            label: t('craft.detail.gross_revenue'),
                                            value: fmt(calcData.grossRevenue),
                                            color: '#c9a84c',
                                            sub: `${recipe.outputAmount * quantity} × ${fmt(calcData.sellPriceUnit)} Ag`,
                                        },
                                        {
                                            label: t('craft.detail.market_tax_row', { pct: (calcData.tax * 100).toFixed(1) }),
                                            value: `−${fmt(calcData.grossRevenue * calcData.tax)}`,
                                            color: '#f87171',
                                            sub: premium ? t('craft.detail.premium_tax') : t('craft.detail.non_premium_tax'),
                                        },
                                        {
                                            label: t('craft.detail.net_revenue'),
                                            value: fmt(calcData.netRevenue),
                                            color: '#c9a84c',
                                            bold: true,
                                            divider: true,
                                        },
                                        {
                                            label: t('craft.detail.effective_material_cost'),
                                            value: `−${fmt(calcData.effectiveCost)}`,
                                            color: '#f87171',
                                            sub: useFocus
                                                ? t('craft.detail.after_return', { rr: (calcData.returnRate * 100).toFixed(2) })
                                                : t('craft.detail.without_focus'),
                                        },
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
                                                    {t('craft.detail.net_profit')}
                                                </Typography>
                                                {calcData.margin && (
                                                    <Typography variant="caption" sx={{ color: profitColor(calcData.profit) }}>
                                                        {t('craft.detail.margin', { pct: calcData.margin })}
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
                                                        {t('craft.detail.spf_label')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t('craft.detail.focus_consumed_amount', { amount: fmt(calcData.focusCost) })}
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
                                            {t('craft.detail.incomplete_prices')}
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
