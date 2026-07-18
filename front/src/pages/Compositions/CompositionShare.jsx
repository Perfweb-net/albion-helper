import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Container, Typography, CircularProgress, Alert, Button, Chip, Tooltip, useTheme
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import DownloadIcon from '@mui/icons-material/Download';
import PublicIcon from '@mui/icons-material/Public';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../api';
import { exportCompositionAsJpeg } from './compositionExport';

const SLOTS = ['weapon', 'offhand', 'head', 'armor', 'boots', 'cape', 'food', 'potion', 'mount'];

// cf. CompositionEditor.jsx : mêmes teintes dérivées du thème actif au lieu de
// couleurs sombres codées en dur (illisibles en thème clair).
function sharePalette(theme) {
    const isDark = theme.palette.mode === 'dark';
    return {
        surface:    isDark ? '#161b22' : '#fdf7ec',
        surfaceAlt: isDark ? '#21262d' : '#f0e8d4',
        border:     isDark ? '#30363d' : 'rgba(139,105,20,0.35)',
        muted:      theme.palette.text.secondary,
        text:       theme.palette.text.primary,
        // Bleu/vert "à la GitHub" : contraste correct sur fond sombre, mais
        // ratio ~2:1 sur fond clair (illisible) — .dark du thème passe l'AA (>8:1).
        infoAccent:    isDark ? '#58a6ff' : theme.palette.info.dark,
        successAccent: isDark ? '#3fb950' : theme.palette.success.dark,
    };
}

function SlotIcon({ item, size = 36 }) {
    const theme = useTheme();
    const pal = sharePalette(theme);
    if (!item) return (
        <Box sx={{ width: size, height: size, border: `1px dashed ${pal.border}`, borderRadius: 1, bgcolor: pal.surface }} />
    );
    return (
        <Tooltip title={item.name ?? item.uniqueName}>
            <Box
                component="img"
                src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`}
                alt={item.name}
                sx={{ width: size, height: size, objectFit: 'contain', borderRadius: 1 }}
                onError={e => { e.target.style.opacity = 0; }}
            />
        </Tooltip>
    );
}

function PlayerCard({ player, index }) {
    const { t } = useTranslation();
    const theme = useTheme();
    const pal = sharePalette(theme);
    const SLOT_LABELS = {
        weapon: t('compositions.slot_weapon'), offhand: t('compositions.slot_offhand'),
        head: t('compositions.slot_head'), armor: t('compositions.slot_armor'),
        boots: t('compositions.slot_boots'), cape: t('compositions.slot_cape'),
        food: t('compositions.slot_food'), potion: t('compositions.slot_potion'),
        mount: t('compositions.slot_mount'),
    };
    const isTwoHanded  = player.weapon?.twoHanded === true;
    const visibleSlots = SLOTS.filter(s => s !== 'offhand' || !isTwoHanded);
    const swapSlots    = visibleSlots.filter(s => player.swaps?.[s]);

    return (
        <Box sx={{ p: 1.5, bgcolor: pal.surface, border: `1px solid ${pal.surfaceAlt}`, borderRadius: 2 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: pal.text, mb: 1 }}>
                {index + 1}. {player.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {visibleSlots.map(slot => (
                    <Box key={slot} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}>
                        <SlotIcon item={player[slot]} size={32} />
                        <Typography sx={{ fontSize: '0.55rem', color: pal.muted }}>{SLOT_LABELS[slot]}</Typography>
                    </Box>
                ))}
            </Box>
            {swapSlots.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, pl: 0.5, flexWrap: 'wrap', borderTop: `1px solid ${pal.surfaceAlt}`, pt: 0.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: 'primary.main', mr: 0.5 }}>⇄</Typography>
                    {swapSlots.map(slot => (
                        <SlotIcon key={`swap-${slot}`} item={player.swaps[slot]} size={26} />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default function CompositionShare() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useTheme();
    const pal = sharePalette(theme);
    const [comp, setComp]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        api.get(`/compositions/share/${token}`)
            .then(res => setComp(res.data))
            .catch(() => setError(t('compositions.error_share_not_found')))
            .finally(() => setLoading(false));
    }, [token, t]);

    const handleExport = async () => {
        setExporting(true);
        try { await exportCompositionAsJpeg(comp); }
        catch (e) { setError(e.message); }
        finally { setExporting(false); }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
    );

    if (error) return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Alert severity="error">{error}</Alert>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/compositions')} sx={{ mt: 2 }}>
                {t('common.back')}
            </Button>
        </Container>
    );

    const VISIBILITY_CONFIG = {
        url_only: { label: t('compositions.visibility_url_only'), icon: <LinkIcon   sx={{ fontSize: 12 }} />, color: pal.infoAccent },
        public:   { label: t('compositions.visibility_public'),   icon: <PublicIcon sx={{ fontSize: 12 }} />, color: pal.successAccent },
    };
    const visCfg = VISIBILITY_CONFIG[comp.visibility];

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/compositions')}
                sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
                {t('common.back')}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <GroupsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main', flex: 1 }}>
                    {comp.name}
                </Typography>
                <Chip label={t('compositions.by_owner', { owner: comp.owner })} size="small" sx={{ bgcolor: pal.surfaceAlt, color: pal.text }} />
                <Chip label={t('compositions.player_count', { count: comp.players.length })} size="small" sx={{ bgcolor: pal.surfaceAlt, color: pal.text }} />
                {visCfg && (
                    <Chip
                        icon={visCfg.icon}
                        label={visCfg.label}
                        size="small"
                        sx={{ bgcolor: pal.surfaceAlt, color: visCfg.color, '& .MuiChip-icon': { color: visCfg.color } }}
                    />
                )}
                <Button
                    size="small" variant="outlined"
                    startIcon={exporting ? <CircularProgress size={14} /> : <DownloadIcon />}
                    onClick={handleExport}
                    disabled={exporting}
                >
                    {t('compositions.export_jpeg')}
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.5 }}>
                {comp.players.map((player, i) => (
                    <PlayerCard key={i} player={player} index={i} />
                ))}
            </Box>
        </Container>
    );
}
