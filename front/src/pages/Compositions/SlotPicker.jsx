import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Box, Typography, CircularProgress, InputAdornment, IconButton, Tooltip, useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../api';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

// Slot → uniqueName suffixes valides pour ce slot, une fois le préfixe de tier
// ("T4_", "T8_"...) retiré — la composition ne cible pas un tier précis, tous
// les tiers sont cherchés puis dédupliqués sur le tier le plus haut existant.
const SLOT_SUFFIXES = {
    weapon:  ['MAIN_', '2H_'],
    offhand: ['OFF_'],
    head:    ['HEAD_'],
    armor:   ['ARMOR_'],
    boots:   ['SHOES_'],
    cape:    ['CAPE', 'CAPEITEM_'],
    food:    ['FOOD_', 'MEAL_', 'POTION_BEEF'],
    potion:  ['POTION_'],
    mount:   ['MOUNT_'],
};

const TIER_PREFIX_RE = /^T\d+_/;

function baseName(uniqueName) {
    return uniqueName.replace(TIER_PREFIX_RE, '');
}

function isTwoHanded(uniqueName) {
    return baseName(uniqueName ?? '').startsWith('2H_');
}

function matchesSlot(uniqueName, slot) {
    const suffixes = SLOT_SUFFIXES[slot] ?? [];
    const rest = baseName(uniqueName);
    return suffixes.some(s => rest.startsWith(s));
}

// Un même objet existe décliné sur plusieurs tiers (T4_MAIN_SWORD, T5_MAIN_SWORD...) :
// on n'affiche qu'une seule entrée par objet, celle du tier le plus haut disponible.
function dedupeHighestTier(items) {
    const bestByBase = new Map();
    for (const item of items) {
        const key = baseName(item.uniqueName);
        const current = bestByBase.get(key);
        if (!current || (item.tier ?? 0) > (current.tier ?? 0)) {
            bestByBase.set(key, item);
        }
    }
    return [...bestByBase.values()];
}

export default function SlotPicker({ open, slot, onSelect, onClose, isSwap }) {
    const { t } = useTranslation();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pal = {
        surface:    isDark ? '#161b22' : '#fdf7ec',
        surfaceAlt: isDark ? '#21262d' : '#f0e8d4',
        surfaceHover: isDark ? '#2d333b' : '#e8dcbe',
        border:     isDark ? '#30363d' : 'rgba(139,105,20,0.35)',
        muted:      theme.palette.text.secondary,
        text:       theme.palette.text.primary,
        gold:       theme.palette.primary.main,
    };
    const SLOT_LABELS = {
        weapon: t('compositions.slot_picker_weapon'), offhand: t('compositions.slot_picker_offhand'),
        head: t('compositions.slot_picker_head'), armor: t('compositions.slot_picker_armor'),
        boots: t('compositions.slot_picker_boots'), cape: t('compositions.slot_picker_cape'),
        food: t('compositions.slot_picker_food'), potion: t('compositions.slot_picker_potion'),
        mount: t('compositions.slot_picker_mount'),
    };
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = async (q) => {
        setLoading(true);
        try {
            const res = await api.get('/items/search', {
                params: { q, lang: 'fr' }
            });
            const filtered = res.data.filter(item => matchesSlot(item.uniqueName, slot));
            setResults(dedupeHighestTier(filtered).slice(0, 40));
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const { query, setQuery, triggerSearch, rateLimited } = useDebouncedSearch(search, { delay: 280 });

    useEffect(() => {
        if (!open) { setQuery(''); setResults([]); }
    }, [open]);

    const handleSelect = (item) => {
        onSelect({
            uniqueName: item.uniqueName,
            name: item.name,
            twoHanded: isTwoHanded(item.uniqueName),
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { bgcolor: pal.surface, border: '1px solid rgba(201,168,76,0.25)' } }}
        >
            <DialogTitle sx={{ fontFamily: 'Cinzel, serif', color: pal.gold, pb: 1 }}>
                {isSwap ? '⇄ Swap — ' : ''}{SLOT_LABELS[slot] ?? slot}
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder={t('compositions.search_placeholder')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter') triggerSearch(); }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: pal.muted }} /></InputAdornment>,
                        endAdornment: query ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setQuery('')}><ClearIcon fontSize="small" /></IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{ mb: 2 }}
                />

                {loading && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>}

                {!loading && rateLimited && (
                    <Typography color="warning.main" sx={{ textAlign: 'center', py: 1, fontSize: '0.8rem' }}>
                        {t('common.rate_limited')}
                    </Typography>
                )}

                {!loading && query.trim().length > 0 && query.trim().length < 3 && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.85rem' }}>
                        {t('compositions.search_hint')}
                    </Typography>
                )}

                {!loading && results.length === 0 && query.trim().length >= 3 && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        {t('compositions.no_results')}
                    </Typography>
                )}

                {!loading && results.length === 0 && !query && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.85rem' }}>
                        {t('compositions.search_hint')}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {results.map(item => (
                        <Tooltip key={item.uniqueName} title={item.uniqueName} placement="top">
                            <Box
                                onClick={() => handleSelect(item)}
                                sx={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    gap: 0.5, p: 1, borderRadius: 1, cursor: 'pointer',
                                    bgcolor: pal.surfaceAlt, border: `1px solid ${pal.border}`,
                                    width: 72,
                                    '&:hover': { borderColor: pal.gold, bgcolor: pal.surfaceHover },
                                }}
                            >
                                <Box
                                    component="img"
                                    src={item.iconUrl}
                                    alt={item.name}
                                    sx={{ width: 40, height: 40, objectFit: 'contain' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <Typography sx={{ fontSize: '0.6rem', color: pal.text, textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                    {item.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} size="small">{t('common.cancel')}</Button>
                <Button onClick={triggerSearch} size="small" variant={rateLimited ? 'contained' : 'text'}
                    startIcon={<SearchIcon fontSize="small" />} disabled={query.trim().length === 0}>
                    {t('common.search')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
