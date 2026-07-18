import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Joyride, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import {
    Box, Container, Typography, Card, CardContent, Grid2, Button, Slider,
    FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
    TextField, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, CircularProgress, Alert, Tabs, Tab, Tooltip, IconButton,
    Divider, InputAdornment, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SavingsIcon from '@mui/icons-material/Savings';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import TerrainIcon from '@mui/icons-material/Terrain';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../../api';
import {
    CITIES, WEAPON_BRANCHES, ARMOR_BRANCHES, ACCESSORY_BRANCHES,
    FOOD_BRANCHES, POTION_BRANCHES, REFINING_BRANCHES, ALL_SPEC_BRANCHES,
    SUBCATEGORY_TO_SPEC, SPEC_MAX_LPB, REFINING_SPECIALTY, CRAFTING_SPECIALTY,
    getCitySpecBonus, computeLPB, focusCostMultiplier, rrFromLPB, computeProfit,
} from './craftUtils';

// ─────────────────────────────────────────────────────────────────────────────
// UI-only constants (not needed in tests)
// ─────────────────────────────────────────────────────────────────────────────

const TAB_CATEGORIES = [null, 'refinement', 'weapons', 'armor', 'food'];

// Internal keys — labels rendered via t() at display time
const CATEGORY_KEYS = {
    weapons: 'craft.category.weapons',
    armor: 'craft.category.armor',
    food: 'craft.category.food',
    refinement: 'craft.category.refinement',
    other: 'craft.category.other',
};
const SUBCATEGORY_KEYS = {
    sword: 'craft.subcategory.sword',
    bow: 'craft.subcategory.bow',
    axe: 'craft.subcategory.axe',
    spear: 'craft.subcategory.spear',
    crossbow: 'craft.subcategory.crossbow',
    plate: 'craft.subcategory.plate',
    leather: 'craft.subcategory.leather',
    cloth: 'craft.subcategory.cloth',
    wood: 'craft.subcategory.wood',
    metal: 'craft.subcategory.metal',
    hide: 'craft.subcategory.hide',
    fiber: 'craft.subcategory.fiber',
    stone: 'craft.subcategory.stone',
    stew: 'craft.subcategory.stew',
    omelette: 'craft.subcategory.omelette',
};

const WEAPON_BRANCH_KEYS = {
    sword: 'craft.branch.sword', axe: 'craft.branch.axe', mace: 'craft.branch.mace',
    hammer: 'craft.branch.hammer', spear: 'craft.branch.spear', crossbow: 'craft.branch.crossbow',
    bow: 'craft.branch.bow', dagger: 'craft.branch.dagger', quarterstaff: 'craft.branch.quarterstaff',
    arcane: 'craft.branch.arcane', curse: 'craft.branch.curse', fire: 'craft.branch.fire',
    frost: 'craft.branch.frost', holy: 'craft.branch.holy', nature: 'craft.branch.nature',
    wargloves: 'craft.branch.wargloves', shapeshifter: 'craft.branch.shapeshifter',
};
const ARMOR_BRANCH_KEYS = {
    plate_helmet: 'craft.branch.plate_helmet', plate_chest: 'craft.branch.plate_chest',
    plate_boots: 'craft.branch.plate_boots', leather_helmet: 'craft.branch.leather_helmet',
    leather_chest: 'craft.branch.leather_chest', leather_boots: 'craft.branch.leather_boots',
    cloth_helmet: 'craft.branch.cloth_helmet', cloth_chest: 'craft.branch.cloth_chest',
    cloth_boots: 'craft.branch.cloth_boots',
};
const ACCESSORY_BRANCH_KEYS = {
    offhand: 'craft.branch.offhand', bag: 'craft.branch.bag', cape: 'craft.branch.cape',
};
const FOOD_BRANCH_KEYS = {
    pie: 'craft.branch.pie', omelette: 'craft.branch.omelette', stew: 'craft.branch.stew',
    salad: 'craft.branch.salad', roast: 'craft.branch.roast', soup: 'craft.branch.soup',
    sandwich: 'craft.branch.sandwich',
};
const POTION_BRANCH_KEYS = {
    healing_potion: 'craft.branch.healing_potion', energy_potion: 'craft.branch.energy_potion',
    stoneskin_potion: 'craft.branch.stoneskin_potion', resistance_potion: 'craft.branch.resistance_potion',
    gigantify_potion: 'craft.branch.gigantify_potion', berserk_potion: 'craft.branch.berserk_potion',
};
const REFINING_BRANCH_KEYS = {
    wood: 'craft.branch.wood', metal: 'craft.branch.metal', hide: 'craft.branch.hide',
    fiber: 'craft.branch.fiber', stone: 'craft.branch.stone',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = n => {
    if (!n && n !== 0) return '—';
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return Math.round(n).toLocaleString('fr-FR');
};

const profitColor = p => (p > 0 ? '#4ade80' : p < 0 ? '#f87171' : 'text.secondary');

// Scrolle la cible du tuto à une hauteur fixe depuis le haut plutôt que de la
// centrer/aligner en haut : laisse de la place pour le tooltip qu'il se place
// au-dessus ou en dessous, et évite de tenter de "centrer" .craft-table qui
// fait plusieurs milliers de pixels de haut (impossible dans le viewport).
const TOUR_TARGET_TOP_OFFSET = 260;

function scrollTourTargetIntoView(selector) {
    const el = selector ? document.querySelector(selector) : null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    window.scrollBy({ top: rect.top - TOUR_TARGET_TOP_OFFSET, behavior: 'instant' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const Craft = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Location & city
    const [locationType, setLocationType] = useState('city'); // 'city' | 'hideout' | 'island'
    const [city, setCity] = useState('Caerleon');
    const [hoBaseReturn, setHoBaseReturn] = useState(26); // % return WITHOUT focus in HO

    // Settings
    const [premium, setPremium] = useState(false);
    const [useFocus, setUseFocus] = useState(false);
    const [dailyBonus, setDailyBonus] = useState(0);
    const [specializations, setSpecializations] = useState(
        () => Object.fromEntries(ALL_SPEC_BRANCHES.map(b => [b, 0]))
    );
    const [quantity, setQuantity] = useState(1);

    // Joyride steps built inside component so t() is available.
    // La colonne SPF n'existe dans le DOM que si "Utiliser le focus" est actif
    // (cf. rendu conditionnel {useFocus && (...)} sur .craft-spf-col plus bas) —
    // sans ce filtre, Joyride cible un élément absent et le tooltip part hors écran.
    //
    // skipScroll: true partout — le scroll-to-target intégré de Joyride v3 ne
    // fonctionne pas de façon fiable ici (bloqué à scrollY=0 sans erreur visible),
    // on le fait nous-mêmes dans handleTourCallback pour garantir que la cible
    // (notamment .craft-table, loin en bas de page) reste dans l'écran.
    const TOUR_STEPS = [
        {
            target: '.craft-location',
            title: t('craft.tour.location.title'),
            content: t('craft.tour.location.content'),
        },
        {
            target: '.craft-settings',
            title: t('craft.tour.settings.title'),
            content: t('craft.tour.settings.content'),
        },
        {
            target: '.craft-spec',
            title: t('craft.tour.spec.title'),
            content: t('craft.tour.spec.content'),
        },
        {
            target: '.craft-load-btn',
            title: t('craft.tour.load.title'),
            content: t('craft.tour.load.content'),
        },
        {
            target: '.craft-table',
            title: t('craft.tour.table.title'),
            content: t('craft.tour.table.content'),
        },
        ...(useFocus ? [{
            target: '.craft-spf-col',
            title: t('craft.tour.spf.title'),
            content: t('craft.tour.spf.content'),
        }] : []),
    ].map(step => ({ ...step, skipScroll: true }));

    // Data
    const [recipes, setRecipes] = useState([]);
    const [marketData, setMarketData] = useState({});
    const [loadingRecipes, setLoadingRecipes] = useState(true);
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [error, setError] = useState('');
    const [prefsSaved, setPrefsSaved] = useState(false);

    // UI
    const [tab, setTab] = useState(0);
    const [sortBy, setSortBy] = useState('profit');
    const [sortDir, setSortDir] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [runTour, setRunTour] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);

    // Load preferences
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

    useEffect(() => {
        setLoadingRecipes(true);
        api.get(`/crafting/recipes?lang=${i18n.language}`)
            .then(r => setRecipes(r.data))
            .catch(() => setError(t('craft.error.load_recipes')))
            .finally(() => setLoadingRecipes(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language]);

    const savePrefs = useCallback(async () => {
        await api.put('/profile/preferences', { city, locationType, hoBaseReturn, premium, useFocus, dailyBonus, specializations }).catch(() => {});
        setPrefsSaved(true);
        setTimeout(() => setPrefsSaved(false), 2000);
    }, [city, locationType, hoBaseReturn, premium, useFocus, dailyBonus, specializations]);

    const neededItems = useMemo(() => {
        const set = new Set();
        for (const r of recipes) {
            set.add(r.uniqueName);
            for (const ing of r.ingredients) set.add(ing.uniqueName);
        }
        return [...set];
    }, [recipes]);

    const loadPrices = async () => {
        if (neededItems.length === 0) return;
        setLoadingPrices(true);
        setError('');
        try {
            const res = await api.post('/items/market/batch', { items: neededItems, quality: 1 });
            setMarketData(res.data);
        } catch {
            setError(t('craft.error.load_prices'));
        } finally {
            setLoadingPrices(false);
        }
    };

    const settings = { locationType, hoBaseReturn, city, premium, useFocus, specializations, dailyBonus };

    const results = useMemo(() => {
        const catFilter = TAB_CATEGORIES[tab];
        const term = searchTerm.trim().toLowerCase();
        const filtered = recipes.filter(r => {
            if (catFilter && r.category !== catFilter) return false;
            if (term) {
                const label = (r.name || r.uniqueName).toLowerCase();
                const un = r.uniqueName.toLowerCase();
                return label.includes(term) || un.includes(term);
            }
            return true;
        });
        const computed = filtered.map(r => ({ recipe: r, calc: computeProfit(r, marketData, settings, quantity) }));
        computed.sort((a, b) => {
            let va, vb;
            if (sortBy === 'spf') { va = a.calc.spf ?? -Infinity; vb = b.calc.spf ?? -Infinity; }
            else if (sortBy === 'profit') { va = a.calc.profit; vb = b.calc.profit; }
            else if (sortBy === 'cost') { va = a.calc.materialCost; vb = b.calc.materialCost; }
            else { va = a.recipe.tier; vb = b.recipe.tier; }
            return sortDir === 'desc' ? vb - va : va - vb;
        });
        return computed;
    }, [recipes, marketData, settings, quantity, tab, sortBy, sortDir, searchTerm]);

    const toggleSort = col => {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const SortIcon = ({ col }) => sortBy !== col ? null :
        (sortDir === 'desc' ? <ArrowDownwardIcon sx={{ fontSize: 14 }} /> : <ArrowUpwardIcon sx={{ fontSize: 14 }} />);

    // react-joyride v3 a changé son API (callback -> onEvent) et son scroll-to-target
    // intégré ne fonctionne pas de façon fiable ici (le tooltip se positionne d'après
    // les coordonnées du target AVANT que le scroll n'ait eu lieu, donc part hors écran
    // pour les cibles loin en bas de page comme .craft-table). Steps en skipScroll: true
    // + tour piloté en mode "controlled" (stepIndex) : on scrolle la cible en vue et on
    // attend la fin du scroll AVANT de faire avancer l'étape, pour garantir l'ordre.
    const handleTourCallback = d => {
        if (d.type === EVENTS.STEP_AFTER || d.type === EVENTS.TARGET_NOT_FOUND) {
            let nextIndex = d.index;
            if (d.action === ACTIONS.NEXT) nextIndex = d.index + 1;
            else if (d.action === ACTIONS.PREV) nextIndex = d.index - 1;
            else return;

            scrollTourTargetIntoView(TOUR_STEPS[nextIndex]?.target);
            setTourStepIndex(nextIndex);
        } else if (d.type === EVENTS.TOUR_START) {
            setTourStepIndex(0);
        }
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(d.status)) {
            setRunTour(false);
            setTourStepIndex(0);
        }
    };

    const tourStyles = {
        options: { backgroundColor: '#1e1a10', textColor: '#f5edd8', primaryColor: '#c9a84c', zIndex: 10000 },
        tooltip: { border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6 },
        tooltipTitle: { fontFamily: 'Cinzel, serif', color: '#c9a84c' },
        buttonNext: { backgroundColor: '#c9a84c', color: '#1e1a10' },
        buttonBack: { color: '#c9a84c' },
    };

    const hasPrices = Object.keys(marketData).length > 0;

    // RR preview range: base (spec=0) → max spec (spec=100)
    const previewRR = () => {
        const demoRecipe = { category: 'weapons', subcategory: '', uniqueName: '' };
        const citySpec = getCitySpecBonus(locationType, city, demoRecipe);
        const lpbBase = computeLPB({ locationType, hoBaseReturn, citySpecBonus: citySpec, dailyBonus, useFocus, specLpbBonus: 0 });
        const lpbMax  = computeLPB({ locationType, hoBaseReturn, citySpecBonus: citySpec, dailyBonus, useFocus, specLpbBonus: SPEC_MAX_LPB });
        const rrBase = (rrFromLPB(lpbBase) * 100).toFixed(1);
        const rrMax  = (rrFromLPB(lpbMax)  * 100).toFixed(1);
        return rrBase === rrMax ? rrBase : `${rrBase} → ${rrMax}`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Joyride steps={TOUR_STEPS} run={runTour} stepIndex={tourStepIndex} continuous showSkipButton onEvent={handleTourCallback}
                styles={tourStyles}
                locale={{
                    back: t('tutorial.back'),
                    close: t('common.close'),
                    last: t('tutorial.finish'),
                    next: t('tutorial.next'),
                    skip: t('tutorial.skip'),
                }} />

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700} className="ah-page-title" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main' }}>
                        {t('craft.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('craft.subtitle')}
                    </Typography>
                </Box>
                <Tooltip title={t('craft.start_tour')}>
                    <IconButton onClick={() => {
                        scrollTourTargetIntoView(TOUR_STEPS[0]?.target);
                        setTourStepIndex(0);
                        setRunTour(true);
                    }} sx={{ color: 'primary.main' }}>
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Settings card */}
            <Card className="craft-settings" sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 600, mb: 2 }}>
                        {t('craft.settings.title')}
                    </Typography>

                    {/* Location type */}
                    <Box className="craft-location" sx={{ mb: 2.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {t('craft.location.label')}
                        </Typography>
                        <ToggleButtonGroup
                            value={locationType}
                            exclusive
                            onChange={(_, v) => { if (v) setLocationType(v); }}
                            size="small"
                        >
                            <ToggleButton value="city" sx={{ gap: 0.5 }}>
                                <LocationCityIcon sx={{ fontSize: 16 }} /> {t('craft.location.city')}
                            </ToggleButton>
                            <ToggleButton value="hideout" sx={{ gap: 0.5 }}>
                                <HomeIcon sx={{ fontSize: 16 }} /> {t('craft.location.hideout')}
                            </ToggleButton>
                            <ToggleButton value="island" sx={{ gap: 0.5 }}>
                                <TerrainIcon sx={{ fontSize: 16 }} /> {t('craft.location.island')}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Grid2 container spacing={3} alignItems="flex-start">
                        {/* City or HO input */}
                        {locationType === 'city' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="craft-city-label">{t('craft.settings.city')}</InputLabel>
                                    <Select labelId="craft-city-label" value={city} label={t('craft.settings.city')} onChange={e => setCity(e.target.value)}>
                                        {CITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid2>
                        )}
                        {locationType === 'hideout' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label={t('craft.settings.ho_return')}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={hoBaseReturn}
                                    onChange={e => setHoBaseReturn(Math.max(0, Math.min(80, Number(e.target.value))))}
                                    helperText={t('craft.settings.ho_return_hint')}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                            </Grid2>
                        )}
                        {locationType === 'island' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    {t('craft.location.island_info')}
                                </Alert>
                            </Grid2>
                        )}

                        {/* Toggles */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <FormControlLabel
                                    control={<Switch checked={premium} onChange={e => setPremium(e.target.checked)} size="small" color="warning" />}
                                    label={<Typography variant="body2" component="span">
                                        {t('craft.settings.premium')} <Chip label={premium ? '6.5%' : '10.5%'} size="small"
                                            color={premium ? 'success' : 'default'} sx={{ ml: 0.5, height: 18, fontSize: 10 }} />
                                    </Typography>}
                                />
                                <FormControlLabel
                                    control={<Switch checked={useFocus} onChange={e => setUseFocus(e.target.checked)} size="small" color="info" />}
                                    label={<Typography variant="body2" component="span">
                                        {t('craft.settings.focus')} <Chip label="+59% LPB" size="small"
                                            color={useFocus ? 'info' : 'default'} sx={{ ml: 0.5, height: 18, fontSize: 10 }} />
                                    </Typography>}
                                />
                            </Box>
                        </Grid2>

                        {/* Daily bonus */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                label={t('craft.settings.daily_bonus')}
                                type="number"
                                size="small"
                                fullWidth
                                value={dailyBonus}
                                onChange={e => setDailyBonus(Math.max(0, Math.min(20, Number(e.target.value))))}
                                helperText={t('craft.settings.daily_bonus_hint')}
                                slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                            />
                        </Grid2>

                        {/* Quantity */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 1 }} className="craft-quantity">
                            <TextField
                                label={t('craft.settings.quantity')}
                                type="number"
                                size="small"
                                fullWidth
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
                            />
                        </Grid2>

                        {/* Actions */}
                        <Grid2 size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <Button variant="outlined" size="small" onClick={savePrefs}
                                sx={{ borderColor: 'rgba(201,168,76,0.4)', color: 'rgba(201,168,76,0.9)', height: 40 }}>
                                {prefsSaved ? t('craft.prefs_saved') : t('craft.save_prefs')}
                            </Button>
                            <Button className="craft-load-btn" variant="contained" size="small"
                                startIcon={loadingPrices ? <CircularProgress size={14} /> : <RefreshIcon />}
                                onClick={loadPrices} disabled={loadingPrices || recipes.length === 0}
                                sx={{ height: 40 }}>
                                {hasPrices ? t('craft.refresh_prices') : t('craft.load_prices')}
                            </Button>
                        </Grid2>
                    </Grid2>

                    {/* Specializations */}
                    <Divider sx={{ my: 2 }} />
                    <Box className="craft-spec">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('craft.spec.title')}
                            </Typography>
                            <Tooltip title={t('craft.spec.tooltip')}>
                                <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'help' }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                            {t('craft.spec.rr_preview')} <strong>{previewRR()}%</strong>
                        </Typography>

                        {[
                            { labelKey: 'craft.spec_group.weapons', branches: WEAPON_BRANCHES, keys: WEAPON_BRANCH_KEYS },
                            { labelKey: 'craft.spec_group.armor', branches: ARMOR_BRANCHES, keys: ARMOR_BRANCH_KEYS },
                            { labelKey: 'craft.spec_group.accessories', branches: ACCESSORY_BRANCHES, keys: ACCESSORY_BRANCH_KEYS },
                            { labelKey: 'craft.spec_group.food', branches: FOOD_BRANCHES, keys: FOOD_BRANCH_KEYS },
                            { labelKey: 'craft.spec_group.potions', branches: POTION_BRANCHES, keys: POTION_BRANCH_KEYS },
                            { labelKey: 'craft.spec_group.refining', branches: REFINING_BRANCHES, keys: REFINING_BRANCH_KEYS },
                        ].map(({ labelKey, branches, keys }) => (
                            <Box key={labelKey} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {t(labelKey)}
                                </Typography>
                                <Grid2 container spacing={1.5} sx={{ mt: 0.5 }}>
                                    {branches.map(branch => {
                                        const spec = specializations[branch] ?? 0;
                                        const branchLabel = t(keys[branch] || branch);
                                        return (
                                            <Grid2 key={branch} size={{ xs: 6, sm: 4, md: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                                    <Typography variant="caption">{branchLabel}</Typography>
                                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{spec}</Typography>
                                                </Box>
                                                <Slider
                                                    size="small" value={spec} min={0} max={100} step={1}
                                                    aria-label={t('craft.spec.aria_label', { branch: branchLabel })}
                                                    onChange={(_, v) => setSpecializations(prev => ({ ...prev, [branch]: v }))}
                                                    sx={{ color: 'primary.main', py: '6px' }}
                                                />
                                            </Grid2>
                                        );
                                    })}
                                </Grid2>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* City bonus summary */}
            {locationType === 'city' && city !== 'Caerleon' && city !== 'Brecilien' && (
                <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 2, fontSize: 13 }}>
                    <strong>{city}</strong> {t('craft.city_bonus.refining', {
                        resource: Object.entries(REFINING_SPECIALTY).find(([c]) => c === city)?.[1] || '—',
                    })}{' · '}{t('craft.city_bonus.crafting', {
                        items: (CRAFTING_SPECIALTY[city] || []).join(', ') || '—',
                    })}
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {!hasPrices && !loadingPrices && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('craft.alert.no_prices', { button: t('craft.load_prices') })}
                </Alert>
            )}

            {/* Tabs + filtre */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ maxWidth: '100%', minWidth: 0, '& .MuiTab-root': { fontSize: '0.8rem' } }}
                >
                    <Tab label={t('craft.tab.all')} />
                    <Tab label={t('craft.tab.refining')} />
                    <Tab label={t('craft.tab.weapons')} />
                    <Tab label={t('craft.tab.armor')} />
                    <Tab label={t('craft.tab.food')} />
                </Tabs>
                <TextField
                    size="small"
                    placeholder={t('craft.filter_placeholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    sx={{ ml: 'auto', minWidth: 200 }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">🔍</InputAdornment> } }}
                />
            </Box>

            {loadingRecipes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} className="craft-table" sx={{ border: '1px solid rgba(201,168,76,0.15)' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(201,168,76,0.07)' }}>
                                <TableCell sx={{ fontWeight: 700, minWidth: 230 }}>{t('craft.table.recipe')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{t('craft.table.tier')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                    onClick={() => toggleSort('cost')}>
                                    {t('craft.table.material_cost')} <SortIcon col="cost" />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                                    {t('craft.table.focus_return')}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{t('craft.table.effective_cost')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <StorefrontIcon sx={{ fontSize: 14 }} /> {t('craft.table.sell_price')}
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                    onClick={() => toggleSort('profit')}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <SavingsIcon sx={{ fontSize: 14 }} /> {t('craft.table.profit')} <SortIcon col="profit" />
                                    </Box>
                                </TableCell>
                                {useFocus && (
                                    <TableCell className="craft-spf-col" align="right"
                                        sx={{ fontWeight: 700, color: '#60a5fa', cursor: 'pointer', '&:hover': { color: '#93c5fd' } }}
                                        onClick={() => toggleSort('spf')}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                            <FlashOnIcon sx={{ fontSize: 14 }} /> {t('craft.table.spf')} <SortIcon col="spf" />
                                        </Box>
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.map(({ recipe, calc }) => {
                                const citySpecBonus = calc.citySpecBonus;
                                const hasSpecBonus = citySpecBonus > 0;
                                return (
                                    <TableRow key={recipe.id}
                                        onClick={() => navigate(`/craft/${recipe.id}`)}
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(201,168,76,0.08)' }, opacity: calc.allPricesAvailable ? 1 : 0.6 }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box component="img"
                                                    src={`https://render.albiononline.com/v1/item/${recipe.uniqueName}.png`}
                                                    alt={recipe.uniqueName}
                                                    sx={{ width: 32, height: 32, imageRendering: 'pixelated', flexShrink: 0 }}
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                                        {recipe.name || recipe.uniqueName}
                                                    </Typography>
                                                    {recipe.name && (
                                                        <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
                                                            {recipe.uniqueName}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                                                        <Chip label={t(CATEGORY_KEYS[recipe.category] || recipe.category)}
                                                            size="small" sx={{ height: 16, fontSize: 10 }} />
                                                        {recipe.subcategory && (
                                                            <Chip label={t(SUBCATEGORY_KEYS[recipe.subcategory] || recipe.subcategory)}
                                                                size="small" variant="outlined" sx={{ height: 16, fontSize: 10 }} />
                                                        )}
                                                        {hasSpecBonus && (
                                                            <Chip
                                                                label={t('craft.chip.spec_bonus', {
                                                                    bonus: citySpecBonus,
                                                                    type: recipe.category === 'refinement' ? t('craft.chip.refining') : t('craft.chip.craft'),
                                                                })}
                                                                size="small" color="success" sx={{ height: 16, fontSize: 10 }} />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip label={`T${recipe.tier}`} size="small" color="primary" sx={{ height: 20 }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">{fmt(calc.materialCost)}</Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#60a5fa' }}>
                                            {useFocus ? (
                                                <Box>
                                                    <Typography variant="body2">
                                                        -{fmt(calc.savedMaterials)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {(calc.returnRate * 100).toFixed(1)}% · LPB {calc.lpb.toFixed(0)}%
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography variant="body2" color="text.disabled">—</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        RR {(rrFromLPB(calc.lpbNoFocus) * 100).toFixed(1)}%
                                                    </Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">{fmt(calc.effectiveCost)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {calc.sellPriceUnit > 0 ? (
                                                <Box>
                                                    <Typography variant="body2">{fmt(calc.netRevenue)}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        -{premium ? '6.5' : '10.5'}% {t('craft.table.tax')}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Tooltip title={t('craft.table.no_price_tooltip')}>
                                                    <Typography variant="body2" color="text.disabled" sx={{ cursor: 'help' }}>N/A</Typography>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={700}
                                                sx={{ color: profitColor(calc.profit) }}>
                                                {calc.sellPriceUnit > 0 ? fmt(calc.profit) : '—'}
                                            </Typography>
                                            {calc.profit !== 0 && calc.materialCost > 0 && calc.sellPriceUnit > 0 && (
                                                <Typography variant="caption" sx={{ color: profitColor(calc.profit) }}>
                                                    {((calc.profit / calc.materialCost) * 100).toFixed(1)}%
                                                </Typography>
                                            )}
                                        </TableCell>
                                        {useFocus && (
                                            <TableCell align="right" sx={{ color: '#60a5fa' }}>
                                                {calc.spf !== null ? (
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700}
                                                            sx={{ color: calc.spf > 0 ? '#60a5fa' : '#f87171' }}>
                                                            {fmt(calc.spf)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {fmt(calc.focusCost)} F
                                                        </Typography>
                                                    </Box>
                                                ) : '—'}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {results.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        {t('craft.table.no_results')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {hasPrices && results.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {t('craft.summary', {
                        withPrices: results.filter(r => r.calc.allPricesAvailable).length,
                        total: results.length,
                        profitable: results.filter(r => r.calc.profit > 0).length,
                    })}
                </Typography>
            )}
        </Container>
    );
};

export default Craft;
