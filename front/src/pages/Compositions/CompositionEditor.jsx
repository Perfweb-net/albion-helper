import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Container, Typography, Button, TextField, IconButton, Tooltip,
    CircularProgress, Alert, Paper, Chip, ToggleButtonGroup, ToggleButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import { UserContext } from '../../context/UserContext';
import api from '../../api';
import SlotPicker from './SlotPicker';
import { exportCompositionAsJpeg } from './compositionExport';

const SLOTS = ['weapon', 'offhand', 'head', 'armor', 'boots', 'cape', 'food', 'potion', 'mount'];

function emptyPlayer(index, t) {
    return { name: t('compositions.player_default_name', { n: index + 1 }), weapon: null, offhand: null, head: null, armor: null, boots: null, cape: null, food: null, potion: null, mount: null, swaps: {} };
}

function SlotButton({ item, onClick, size = 44, showLabel, label, chooseLabel }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
            <Tooltip title={item?.name ?? chooseLabel ?? label}>
                <Box
                    onClick={onClick}
                    sx={{
                        width: size, height: size, borderRadius: 1, cursor: 'pointer',
                        border: item ? '1.5px solid rgba(201,168,76,0.5)' : '1.5px dashed #30363d',
                        bgcolor: item ? '#21262d' : '#161b22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', position: 'relative',
                        '&:hover': { borderColor: '#c9a84c', bgcolor: '#21262d' },
                        transition: 'all 0.15s',
                    }}
                >
                    {item ? (
                        <Box
                            component="img"
                            src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`}
                            alt={item.name}
                            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { e.target.style.opacity = 0; }}
                        />
                    ) : (
                        <Typography sx={{ fontSize: size > 36 ? '1.2rem' : '0.9rem', opacity: 0.4 }}>+</Typography>
                    )}
                </Box>
            </Tooltip>
            {showLabel && (
                <Typography sx={{ fontSize: '0.58rem', color: '#8b949e', lineHeight: 1 }}>{label}</Typography>
            )}
        </Box>
    );
}

function PlayerRow({ player, index, onChange, onRemove }) {
    const { t } = useTranslation();
    const SLOT_LABELS = {
        weapon: t('compositions.slot_weapon'), offhand: t('compositions.slot_offhand'),
        head: t('compositions.slot_head'), armor: t('compositions.slot_armor'),
        boots: t('compositions.slot_boots'), cape: t('compositions.slot_cape'),
        food: t('compositions.slot_food'), potion: t('compositions.slot_potion'),
        mount: t('compositions.slot_mount'),
    };
    const [picker, setPicker]     = useState(null);
    const [showSwaps, setShowSwaps] = useState(Object.keys(player.swaps ?? {}).length > 0);

    const isTwoHanded    = player.weapon?.twoHanded === true;
    const visibleSlots   = SLOTS.filter(s => s !== 'offhand' || !isTwoHanded);

    const handleSelect = (slot, isSwap) => (item) => {
        const updated = { ...player };
        if (isSwap) {
            updated.swaps = { ...updated.swaps, [slot]: item };
        } else {
            updated[slot] = item;
            if (slot === 'weapon' && item?.twoHanded) {
                updated.offhand = null;
                const { offhand: _o, ...rest } = updated.swaps ?? {};
                updated.swaps = rest;
            }
        }
        onChange(index, updated);
    };

    const clearSlot = (slot, isSwap) => (e) => {
        e.stopPropagation();
        const updated = { ...player };
        if (isSwap) {
            const { [slot]: _r, ...rest } = updated.swaps ?? {};
            updated.swaps = rest;
        } else {
            updated[slot] = null;
        }
        onChange(index, updated);
    };

    return (
        <Paper elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: '#161b22', border: '1px solid #21262d', borderRadius: 2, '&:hover': { borderColor: 'rgba(201,168,76,0.2)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ color: '#8b949e', fontSize: '0.8rem', minWidth: 24 }}>{index + 1}.</Typography>

                <TextField
                    size="small"
                    value={player.name}
                    onChange={e => onChange(index, { ...player, name: e.target.value })}
                    sx={{ width: 140 }}
                    inputProps={{ style: { fontSize: '0.82rem', padding: '4px 8px' } }}
                />

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {visibleSlots.map(slot => (
                    <Box key={slot} sx={{ position: 'relative' }}>
                        <SlotButton item={player[slot]} label={SLOT_LABELS[slot]} chooseLabel={t('compositions.choose_slot', { slot: SLOT_LABELS[slot] })} showLabel onClick={() => setPicker({ slot, isSwap: false })} />
                        {player[slot] && (
                            <IconButton size="small" onClick={clearSlot(slot, false)}
                                sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#0d1117', p: '2px', '&:hover': { bgcolor: '#f44336' } }}>
                                <DeleteIcon sx={{ fontSize: 10 }} />
                            </IconButton>
                        )}
                    </Box>
                ))}

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title={showSwaps ? t('compositions.hide_swaps') : t('compositions.manage_swaps')}>
                    <IconButton size="small" onClick={() => setShowSwaps(v => !v)}
                        sx={{ color: showSwaps ? '#c9a84c' : '#8b949e', border: '1px solid', borderColor: showSwaps ? 'rgba(201,168,76,0.5)' : '#30363d' }}>
                        <SwapHorizIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t('compositions.remove_player')}>
                    <IconButton size="small" onClick={() => onRemove(index)} sx={{ color: '#f44336', ml: 'auto' }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {showSwaps && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pl: 5, flexWrap: 'wrap' }}>
                    <Chip label="⇄ swap" size="small" sx={{ bgcolor: '#21262d', color: '#c9a84c', fontSize: '0.7rem', height: 20 }} />
                    {visibleSlots.map(slot => (
                        <Box key={`swap-${slot}`} sx={{ position: 'relative' }}>
                            <SlotButton item={player.swaps?.[slot] ?? null} label={SLOT_LABELS[slot]} chooseLabel={t('compositions.choose_slot', { slot: SLOT_LABELS[slot] })} showLabel size={34} onClick={() => setPicker({ slot, isSwap: true })} />
                            {player.swaps?.[slot] && (
                                <IconButton size="small" onClick={clearSlot(slot, true)}
                                    sx={{ position: 'absolute', top: -5, right: -5, bgcolor: '#0d1117', p: '1px', '&:hover': { bgcolor: '#f44336' } }}>
                                    <DeleteIcon sx={{ fontSize: 9 }} />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {picker && (
                <SlotPicker open slot={picker.slot} isSwap={picker.isSwap}
                    onSelect={handleSelect(picker.slot, picker.isSwap)} onClose={() => setPicker(null)} />
            )}
        </Paper>
    );
}

export default function CompositionEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useContext(UserContext);

    const [comp, setComp]           = useState(null);
    const [name, setName]           = useState('');
    const [players, setPlayers]     = useState([]);
    const [visibility, setVisibility] = useState('private');
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError]         = useState('');
    const [snack, setSnack]         = useState('');
    const [shareDialog, setShareDialog] = useState(false);

    const isNew = id === 'new';

    const load = useCallback(async () => {
        if (isNew) {
            setName(t('compositions.new_composition_name'));
            setPlayers([emptyPlayer(0, t)]);
            setLoading(false);
            return;
        }
        try {
            const res = await api.get(`/compositions/${id}`);
            const c = res.data;
            setComp(c);
            setName(c.name);
            setPlayers(c.players.length ? c.players : [emptyPlayer(0, t)]);
            setVisibility(c.visibility ?? 'private');
        } catch {
            setError(t('compositions.error_not_found'));
        } finally {
            setLoading(false);
        }
    }, [id, isNew, t]);

    useEffect(() => { load(); }, [load]);

    const save = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const res = await api.post('/compositions', { name, players, visibility });
                navigate(`/compositions/${res.data.id}`, { replace: true });
            } else {
                const res = await api.put(`/compositions/${id}`, { name, players, visibility });
                setComp(res.data);
            }
            setSnack(t('compositions.saved'));
        } catch {
            setError(t('compositions.error_save'));
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportCompositionAsJpeg({ name, owner: comp?.owner ?? user?.username ?? '?', players });
        } catch (e) {
            setError(t('compositions.error_export', { message: e.message }));
        } finally {
            setExporting(false);
        }
    };

    const copyShareLink = () => {
        const url = `${window.location.origin}/compositions/share/${comp.shareToken}`;
        navigator.clipboard.writeText(url);
        setSnack(t('compositions.link_copied'));
        setShareDialog(false);
    };

    const VISIBILITY_CONFIG = {
        private:  { label: t('compositions.visibility_private'),  icon: <LockIcon   sx={{ fontSize: 14 }} />, color: '#8b949e' },
        url_only: { label: t('compositions.visibility_url_only'), icon: <LinkIcon   sx={{ fontSize: 14 }} />, color: '#58a6ff' },
        public:   { label: t('compositions.visibility_public'),   icon: <PublicIcon sx={{ fontSize: 14 }} />, color: '#3fb950' },
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    const canShare = !isNew && (visibility === 'url_only' || visibility === 'public');

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <IconButton onClick={() => navigate('/compositions')} size="small">
                    <ArrowBackIcon />
                </IconButton>

                <TextField
                    size="small"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{ width: 280 }}
                    inputProps={{ style: { fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700 } }}
                />

                <Typography sx={{ color: '#8b949e', fontSize: '0.82rem' }}>
                    {t('compositions.player_counter', { count: players.length })}
                </Typography>

                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    {/* Visibility picker */}
                    <ToggleButtonGroup
                        value={visibility}
                        exclusive
                        onChange={(_, v) => { if (v) setVisibility(v); }}
                        size="small"
                        sx={{ bgcolor: '#0d1117', border: '1px solid #30363d', borderRadius: 1 }}
                    >
                        {Object.entries(VISIBILITY_CONFIG).map(([val, cfg]) => (
                            <ToggleButton
                                key={val}
                                value={val}
                                sx={{
                                    px: 1.5, py: 0.5, gap: 0.5, fontSize: '0.75rem', border: 'none',
                                    color: visibility === val ? cfg.color : '#8b949e',
                                    '&.Mui-selected': { bgcolor: '#21262d', color: cfg.color },
                                    '&:hover': { bgcolor: '#21262d' },
                                }}
                            >
                                {cfg.icon}
                                <span>{cfg.label}</span>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {canShare && (
                        <Button size="small" variant="outlined" startIcon={<ShareIcon />} onClick={() => setShareDialog(true)}>
                            {t('compositions.share_link_button')}
                        </Button>
                    )}

                    <Button size="small" variant="outlined"
                        startIcon={exporting ? <CircularProgress size={14} /> : <DownloadIcon />}
                        onClick={handleExport} disabled={exporting || players.length === 0}>
                        {t('compositions.export_jpeg')}
                    </Button>

                    <Button size="small" variant="contained" onClick={save} disabled={saving}
                        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
                        {t('common.save')}
                    </Button>
                </Box>
            </Box>

            {/* Player list */}
            <Box>
                {players.map((player, i) => (
                    <PlayerRow key={i} player={player} index={i}
                        onChange={(idx, updated) => setPlayers(prev => prev.map((p, j) => j === idx ? updated : p))}
                        onRemove={(idx) => setPlayers(prev => prev.filter((_, j) => j !== idx))}
                    />
                ))}
            </Box>

            {players.length < 100 && (
                <Button variant="outlined" startIcon={<PersonAddIcon />}
                    onClick={() => setPlayers(prev => [...prev, emptyPlayer(prev.length, t)])}
                    sx={{ mt: 1, borderStyle: 'dashed' }} fullWidth>
                    {t('compositions.add_player')}
                </Button>
            )}

            {/* Share dialog */}
            <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid rgba(201,168,76,0.25)' } }}>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>{t('compositions.share_dialog_title')}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: '0.82rem', mb: 1.5, color: '#8b949e' }}>
                        {visibility === 'public'
                            ? t('compositions.share_hint_public')
                            : t('compositions.share_hint_url_only')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField size="small" fullWidth
                            value={`${window.location.origin}/compositions/share/${comp?.shareToken}`}
                            InputProps={{ readOnly: true, sx: { fontSize: '0.78rem' } }} />
                        <IconButton onClick={copyShareLink} size="small" sx={{ color: '#c9a84c' }}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareDialog(false)}>{t('common.close')}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')}
                message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        </Container>
    );
}
