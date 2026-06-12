import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
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

const CATEGORY_LABELS = {
    weapons: 'Armes', armor: 'Armures', food: 'Nourriture', refinement: 'Raffinage', other: 'Autre'
};
const SUBCATEGORY_LABELS = {
    sword: 'Épée', bow: 'Arc', axe: 'Hache', spear: 'Lance', crossbow: 'Arbalète',
    plate: 'Armure lourde', leather: 'Cuir', cloth: 'Tissu',
    wood: 'Bois', metal: 'Métal', hide: 'Peau', fiber: 'Fibre', stone: 'Pierre',
    stew: 'Ragoût', omelette: 'Omelette',
};

const WEAPON_BRANCH_LABELS = {
    sword: 'Épée', axe: 'Hache', mace: 'Masse', hammer: 'Marteau',
    spear: 'Lance', crossbow: 'Arbalète', bow: 'Arc', dagger: 'Dague',
    quarterstaff: 'Bâton', arcane: 'Arcane', curse: 'Malédiction',
    fire: 'Feu', frost: 'Givre', holy: 'Sacré', nature: 'Nature',
    wargloves: 'Gantelets', shapeshifter: 'Métamorphe',
};
const ARMOR_BRANCH_LABELS = {
    plate_helmet: 'Casque lourd', plate_chest: 'Armure lourde', plate_boots: 'Bottes lourdes',
    leather_helmet: 'Casque cuir', leather_chest: 'Armure cuir', leather_boots: 'Bottes cuir',
    cloth_helmet: 'Casque tissu', cloth_chest: 'Armure tissu', cloth_boots: 'Bottes tissu',
};
const ACCESSORY_BRANCH_LABELS = { offhand: 'Hors-main', bag: 'Sac', cape: 'Cape' };
const FOOD_BRANCH_LABELS = {
    pie: 'Tarte', omelette: 'Omelette', stew: 'Ragoût',
    salad: 'Salade', roast: 'Rôti', soup: 'Soupe', sandwich: 'Sandwich',
};
const POTION_BRANCH_LABELS = {
    healing_potion: 'Soin', energy_potion: 'Énergie', stoneskin_potion: 'Stoneskin',
    resistance_potion: 'Résistance', gigantify_potion: 'Gigantif.', berserk_potion: 'Berserker',
};
const REFINING_BRANCH_LABELS = {
    wood: 'Bois', metal: 'Métal', hide: 'Peau', fiber: 'Fibre', stone: 'Pierre',
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

// ─────────────────────────────────────────────────────────────────────────────
// Joyride
// ─────────────────────────────────────────────────────────────────────────────

const TOUR_STEPS = [
    { target: '.craft-location', title: 'Lieu de craft', content: 'Choisis ton lieu : ville royale (avec bonus de spécialité), hideout (entre ton % retour actuel sans focus), ou île personnelle (pas de bonus).' },
    { target: '.craft-settings', title: 'Paramètres', content: 'Configure premium (taxe 6.5% vs 10.5%), focus (+59% LPB fixe), bonus journalier et quantité à crafter.' },
    { target: '.craft-spec', title: 'Maîtrise Destiny Board', content: 'La maîtrise (0–100) ne modifie PAS le taux de retour — elle réduit le coût en focus. À 100 : 6.25% du coût de base (divisé par 16). Plus ta maîtrise est haute, meilleur est ton SPF.' },
    { target: '.craft-load-btn', title: 'Charger les prix', content: 'Récupère les prix pour tous les items et ingrédients en un seul appel. Les données sont mises en cache 1h côté serveur.' },
    { target: '.craft-table', title: 'Tableau de résultats', content: 'Coût matières → retour focus → coût effectif → prix vente (net taxe) → bénéfice. Cliquez sur les en-têtes pour trier.' },
    { target: '.craft-spf-col', title: 'SPF — Silver Par Focus', content: 'Trier par SPF te donne le craft le plus rentable par focus dépensé. Essentiel pour maximiser l\'utilisation de tes 10k/jour.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const Craft = () => {
    const navigate = useNavigate();

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
        api.get('/crafting/recipes')
            .then(r => setRecipes(r.data))
            .catch(() => setError('Erreur chargement recettes'))
            .finally(() => setLoadingRecipes(false));
    }, []);

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
            setError('Erreur lors du chargement des prix.');
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

    const handleTourEnd = d => { if ([STATUS.FINISHED, STATUS.SKIPPED].includes(d.status)) setRunTour(false); };

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
            <Joyride steps={TOUR_STEPS} run={runTour} continuous showSkipButton callback={handleTourEnd}
                styles={tourStyles} scrollOffset={80} disableScrollParentFix
                locale={{ back: 'Précédent', close: 'Fermer', last: 'Terminer', next: 'Suivant', skip: 'Passer' }} />

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>
                        Calculateur de Craft
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Formule exacte : Retour = LPB / (100 + LPB) · Taxes : 6.5% premium / 10.5% non-premium
                    </Typography>
                </Box>
                <Tooltip title="Lancer le tutoriel">
                    <IconButton onClick={() => setRunTour(true)} sx={{ color: '#c9a84c' }}>
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Settings card */}
            <Card className="craft-settings" sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 600, mb: 2 }}>
                        Paramètres
                    </Typography>

                    {/* Location type */}
                    <Box className="craft-location" sx={{ mb: 2.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Lieu de craft</Typography>
                        <ToggleButtonGroup
                            value={locationType}
                            exclusive
                            onChange={(_, v) => { if (v) setLocationType(v); }}
                            size="small"
                        >
                            <ToggleButton value="city" sx={{ gap: 0.5 }}>
                                <LocationCityIcon sx={{ fontSize: 16 }} /> Ville royale
                            </ToggleButton>
                            <ToggleButton value="hideout" sx={{ gap: 0.5 }}>
                                <HomeIcon sx={{ fontSize: 16 }} /> Hideout (HO)
                            </ToggleButton>
                            <ToggleButton value="island" sx={{ gap: 0.5 }}>
                                <TerrainIcon sx={{ fontSize: 16 }} /> Île personnelle
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Grid2 container spacing={3} alignItems="flex-start">
                        {/* City or HO input */}
                        {locationType === 'city' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="craft-city-label">Ville</InputLabel>
                                    <Select labelId="craft-city-label" value={city} label="Ville" onChange={e => setCity(e.target.value)}>
                                        {CITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid2>
                        )}
                        {locationType === 'hideout' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label="% retour sans focus (HO)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={hoBaseReturn}
                                    onChange={e => setHoBaseReturn(Math.max(0, Math.min(80, Number(e.target.value))))}
                                    helperText="Visible in-game avant d'utiliser focus"
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                            </Grid2>
                        )}
                        {locationType === 'island' && (
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    Île : LPB de base = 0%. Seuls spec + focus s'appliquent.
                                </Alert>
                            </Grid2>
                        )}

                        {/* Toggles */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <FormControlLabel
                                    control={<Switch checked={premium} onChange={e => setPremium(e.target.checked)} size="small" color="warning" />}
                                    label={<Typography variant="body2" component="span">
                                        Premium <Chip label={premium ? '6.5%' : '10.5%'} size="small"
                                            color={premium ? 'success' : 'default'} sx={{ ml: 0.5, height: 18, fontSize: 10 }} />
                                    </Typography>}
                                />
                                <FormControlLabel
                                    control={<Switch checked={useFocus} onChange={e => setUseFocus(e.target.checked)} size="small" color="info" />}
                                    label={<Typography variant="body2" component="span">
                                        Focus <Chip label="+59% LPB" size="small"
                                            color={useFocus ? 'info' : 'default'} sx={{ ml: 0.5, height: 18, fontSize: 10 }} />
                                    </Typography>}
                                />
                            </Box>
                        </Grid2>

                        {/* Daily bonus */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                label="Bonus journalier"
                                type="number"
                                size="small"
                                fullWidth
                                value={dailyBonus}
                                onChange={e => setDailyBonus(Math.max(0, Math.min(20, Number(e.target.value))))}
                                helperText="0–20% (LPB additionnel)"
                                slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                            />
                        </Grid2>

                        {/* Quantity */}
                        <Grid2 size={{ xs: 12, sm: 6, md: 1 }} className="craft-quantity">
                            <TextField
                                label="Quantité"
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
                                {prefsSaved ? 'Sauvegardé ✓' : 'Sauvegarder profil'}
                            </Button>
                            <Button className="craft-load-btn" variant="contained" size="small"
                                startIcon={loadingPrices ? <CircularProgress size={14} /> : <RefreshIcon />}
                                onClick={loadPrices} disabled={loadingPrices || recipes.length === 0}
                                sx={{ height: 40 }}>
                                {hasPrices ? 'Actualiser les prix' : 'Charger les prix marché'}
                            </Button>
                        </Grid2>
                    </Grid2>

                    {/* Specializations */}
                    <Divider sx={{ my: 2 }} />
                    <Box className="craft-spec">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                Maîtrise Destiny Board (0–100)
                            </Typography>
                            <Tooltip title="La maîtrise Destiny Board a deux effets : (1) augmente le taux de retour jusqu'à +36% LPB à 100 ; (2) réduit le coût en focus (÷2 tous les 10 000 pts, soit 6.25% du coût de base à max).">
                                <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'help' }} />
                            </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                            Taux de retour (maîtrise 0 → 100) : <strong>{previewRR()}%</strong>
                        </Typography>

                        {[
                            { label: 'Armes', branches: WEAPON_BRANCHES, labels: WEAPON_BRANCH_LABELS },
                            { label: 'Armures', branches: ARMOR_BRANCHES, labels: ARMOR_BRANCH_LABELS },
                            { label: 'Accessoires', branches: ACCESSORY_BRANCHES, labels: ACCESSORY_BRANCH_LABELS },
                            { label: 'Nourriture', branches: FOOD_BRANCHES, labels: FOOD_BRANCH_LABELS },
                            { label: 'Potions', branches: POTION_BRANCHES, labels: POTION_BRANCH_LABELS },
                            { label: 'Raffinage', branches: REFINING_BRANCHES, labels: REFINING_BRANCH_LABELS },
                        ].map(({ label, branches, labels }) => (
                            <Box key={label} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {label}
                                </Typography>
                                <Grid2 container spacing={1.5} sx={{ mt: 0.5 }}>
                                    {branches.map(branch => {
                                        const spec = specializations[branch] ?? 0;
                                        return (
                                            <Grid2 key={branch} size={{ xs: 6, sm: 4, md: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                                    <Typography variant="caption">{labels[branch]}</Typography>
                                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{spec}</Typography>
                                                </Box>
                                                <Slider
                                                    size="small" value={spec} min={0} max={100} step={1}
                                                    aria-label={`Maîtrise ${labels[branch]}`}
                                                    onChange={(_, v) => setSpecializations(prev => ({ ...prev, [branch]: v }))}
                                                    sx={{ color: '#c9a84c', py: '6px' }}
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
                    <strong>{city}</strong> : bonus raffinage +40% LPB pour{' '}
                    <strong>{Object.entries(REFINING_SPECIALTY).find(([c]) => c === city)?.[1] || '—'}</strong>{' '}
                    · bonus craft +15% LPB pour{' '}
                    <strong>{(CRAFTING_SPECIALTY[city] || []).join(', ') || '—'}</strong>
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {!hasPrices && !loadingPrices && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Cliquez sur <strong>Charger les prix marché</strong> pour calculer les profits.
                </Alert>
            )}

            {/* Tabs + filtre */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontSize: '0.8rem' } }}>
                    <Tab label="Tous" />
                    <Tab label="Raffinage" />
                    <Tab label="Armes" />
                    <Tab label="Armures" />
                    <Tab label="Nourriture" />
                </Tabs>
                <TextField
                    size="small"
                    placeholder="Filtrer un item..."
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
                                <TableCell sx={{ fontWeight: 700, minWidth: 230 }}>Recette</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Tier</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { color: '#c9a84c' } }}
                                    onClick={() => toggleSort('cost')}>
                                    Coût matières <SortIcon col="cost" />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                                    Retour focus
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Coût effectif</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <StorefrontIcon sx={{ fontSize: 14 }} /> Prix vente
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { color: '#c9a84c' } }}
                                    onClick={() => toggleSort('profit')}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <SavingsIcon sx={{ fontSize: 14 }} /> Bénéfice <SortIcon col="profit" />
                                    </Box>
                                </TableCell>
                                {useFocus && (
                                    <TableCell className="craft-spf-col" align="right"
                                        sx={{ fontWeight: 700, color: '#60a5fa', cursor: 'pointer', '&:hover': { color: '#93c5fd' } }}
                                        onClick={() => toggleSort('spf')}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                            <FlashOnIcon sx={{ fontSize: 14 }} /> SPF <SortIcon col="spf" />
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
                                                        <Chip label={CATEGORY_LABELS[recipe.category] || recipe.category}
                                                            size="small" sx={{ height: 16, fontSize: 10 }} />
                                                        {recipe.subcategory && (
                                                            <Chip label={SUBCATEGORY_LABELS[recipe.subcategory] || recipe.subcategory}
                                                                size="small" variant="outlined" sx={{ height: 16, fontSize: 10 }} />
                                                        )}
                                                        {hasSpecBonus && (
                                                            <Chip
                                                                label={`+${citySpecBonus}% LPB ${recipe.category === 'refinement' ? 'raffinage' : 'craft'}`}
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
                                                        -{premium ? '6.5' : '10.5'}% taxe
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">N/A</Typography>
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
                                        Aucune recette trouvée
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {hasPrices && results.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {results.filter(r => r.calc.allPricesAvailable).length}/{results.length} recettes avec prix complets
                    · {results.filter(r => r.calc.profit > 0).length} rentables
                </Typography>
            )}
        </Container>
    );
};

export default Craft;
