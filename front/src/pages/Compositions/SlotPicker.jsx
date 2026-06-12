import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Box, Typography, CircularProgress, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../api';

// Slot → list of uniqueName prefixes that are valid for that slot (T8 only)
const SLOT_PREFIXES = {
    weapon:  ['T8_MAIN_', 'T8_2H_'],
    offhand: ['T8_OFF_'],
    head:    ['T8_HEAD_'],
    armor:   ['T8_ARMOR_'],
    boots:   ['T8_SHOES_'],
    cape:    ['T8_CAPE', 'T8_CAPEITEM_'],
    food:    ['T8_FOOD_', 'T8_MEAL_', 'T8_POTION_BEEF'],
    potion:  ['T8_POTION_'],
    mount:   ['T8_MOUNT_'],
};

const SLOT_LABELS = {
    weapon: 'Arme principale', offhand: 'Off-hand', head: 'Casque',
    armor: 'Armure', boots: 'Bottes', cape: 'Cape',
    food: 'Nourriture', potion: 'Potion', mount: 'Monture',
};

function isTwoHanded(uniqueName) {
    return uniqueName?.startsWith('T8_2H_') ?? false;
}

function matchesSlot(uniqueName, slot) {
    const prefixes = SLOT_PREFIXES[slot] ?? [];
    return prefixes.some(p => uniqueName.startsWith(p));
}

export default function SlotPicker({ open, slot, onSelect, onClose, isSwap }) {
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const timer = useRef(null);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const res = await api.get('/items/search', {
                params: { q, tier: 8, lang: 'fr' }
            });
            const filtered = res.data.filter(item => matchesSlot(item.uniqueName, slot));
            setResults(filtered.slice(0, 40));
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [slot]);

    useEffect(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => search(query), 280);
        return () => clearTimeout(timer.current);
    }, [query, search]);

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
            PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid rgba(201,168,76,0.25)' } }}
        >
            <DialogTitle sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', pb: 1 }}>
                {isSwap ? '⇄ Swap — ' : ''}{SLOT_LABELS[slot] ?? slot}
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder="Rechercher…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment>,
                        endAdornment: query ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setQuery('')}><ClearIcon fontSize="small" /></IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{ mb: 2 }}
                />

                {loading && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>}

                {!loading && results.length === 0 && query && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Aucun résultat
                    </Typography>
                )}

                {!loading && results.length === 0 && !query && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.85rem' }}>
                        Saisir un nom pour chercher un item T8
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
                                    bgcolor: '#21262d', border: '1px solid #30363d',
                                    width: 72,
                                    '&:hover': { borderColor: '#c9a84c', bgcolor: '#2d333b' },
                                }}
                            >
                                <Box
                                    component="img"
                                    src={item.iconUrl}
                                    alt={item.name}
                                    sx={{ width: 40, height: 40, objectFit: 'contain' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <Typography sx={{ fontSize: '0.6rem', color: '#e8dcc8', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                    {item.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} size="small">Annuler</Button>
            </DialogActions>
        </Dialog>
    );
}
