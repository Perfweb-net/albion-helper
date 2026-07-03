import React, { useState } from 'react';
import {
    Box, Container, Typography, Card, CardContent, TextField, Button, Grid2,
    Chip, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Stack,
    List, ListItemButton, ListItemText, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ShieldIcon from '@mui/icons-material/Shield';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import BattleDetail from './BattleDetail';
import { fmtFame, fmtDate } from '../../components/albion/albionFormat';

const Battles = () => {
    const { t } = useTranslation();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);          // { guilds, alliances }
    const [target, setTarget] = useState(null);            // { type:'guild'|'alliance', id, name }
    const [range, setRange] = useState('week');
    const [battles, setBattles] = useState(null);
    const [selectedBattle, setSelectedBattle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const doSearch = async () => {
        if (query.trim().length < 2) return;
        setLoading(true); setError(''); setResults(null); setBattles(null); setTarget(null); setSelectedBattle(null);
        try {
            const res = await api.get(`/battles/search?q=${encodeURIComponent(query.trim())}`);
            setResults(res.data);
        } catch {
            setError(t('battles.search_error'));
        } finally {
            setLoading(false);
        }
    };

    const loadBattles = async (newTarget, newRange = range) => {
        setLoading(true); setError(''); setBattles(null); setSelectedBattle(null);
        setTarget(newTarget); setRange(newRange);
        try {
            const param = newTarget.type === 'guild' ? `guildId=${newTarget.id}` : `allianceId=${newTarget.id}`;
            const res = await api.get(`/battles?${param}&range=${newRange}&limit=30`);
            setBattles(res.data);
        } catch {
            setError(t('battles.load_error'));
        } finally {
            setLoading(false);
        }
    };

    if (selectedBattle) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedBattle(null)} sx={{ mb: 2 }}>
                    {t('battles.back_to_battles')}
                </Button>
                <BattleDetail battleId={selectedBattle} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MilitaryTechIcon color="primary" sx={{ fontSize: 36 }} />
                    <Typography variant="h3" fontWeight={700}>{t('battles.title')}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    {t('battles.subtitle')}
                </Typography>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 10 }}>
                            <TextField
                                fullWidth label={t('battles.search_label')} value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 2 }}>
                            <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={doSearch} sx={{ height: 56 }}>
                                {t('common.search')}
                            </Button>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>

            {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

            {/* Résultats de recherche */}
            {!loading && results && !target && (
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            <ShieldIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            {t('battles.guilds_count', { count: results.guilds.length })}
                        </Typography>
                        <List dense>
                            {results.guilds.map(g => (
                                <ListItemButton key={g.id} onClick={() => loadBattles({ type: 'guild', id: g.id, name: g.name })}>
                                    <ListItemText primary={g.name} secondary={g.allianceTag ? `Alliance : ${g.allianceTag}` : null} />
                                </ListItemButton>
                            ))}
                            {results.guilds.length === 0 && <Typography variant="body2" color="text.secondary">{t('battles.no_guilds')}</Typography>}
                        </List>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            <GroupsIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            {t('battles.alliances_count', { count: results.alliances.length })}
                        </Typography>
                        <List dense>
                            {results.alliances.map(a => (
                                <ListItemButton key={a.id} onClick={() => loadBattles({ type: 'alliance', id: a.id, name: a.name })}>
                                    <ListItemText primary={a.tag ? `[${a.tag}] ${a.name}` : a.name} />
                                </ListItemButton>
                            ))}
                            {results.alliances.length === 0 && <Typography variant="body2" color="text.secondary">{t('battles.no_alliances')}</Typography>}
                        </List>
                    </Grid2>
                </Grid2>
            )}

            {/* Liste des batailles */}
            {!loading && target && battles && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Box>
                            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => { setTarget(null); setBattles(null); }}>
                                {t('common.back')}
                            </Button>
                            <Typography variant="h6" fontWeight={700} component="span" sx={{ ml: 1 }}>
                                {target.type === 'guild' ? t('battles.guild_label') : t('battles.alliance_label')} : {target.name}
                            </Typography>
                        </Box>
                        <ToggleButtonGroup size="small" exclusive value={range}
                            onChange={(_, v) => v && loadBattles(target, v)}>
                            <ToggleButton value="day">{t('battles.range_day')}</ToggleButton>
                            <ToggleButton value="week">{t('battles.range_week')}</ToggleButton>
                            <ToggleButton value="month">{t('battles.range_month')}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {battles.length === 0 ? (
                        <Alert severity="info">{t('battles.no_battles')}</Alert>
                    ) : (
                        <Stack spacing={1.5}>
                            {battles.map(b => (
                                <Card key={b.id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                                    onClick={() => setSelectedBattle(b.id)}>
                                    <CardContent sx={{ py: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{fmtDate(b.startTime)}</Typography>
                                                <Typography variant="caption" color="text.secondary">{b.clusterName || 'Zone inconnue'}</Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                <Chip size="small" icon={<SearchIcon sx={{ fontSize: 14 }} />} label={`${b.totalKills} ${t('battles.kills')}`} />
                                                <Chip size="small" variant="outlined" icon={<GroupsIcon sx={{ fontSize: 14 }} />} label={`${b.playerCount} ${t('battles.players')}`} />
                                                <Chip size="small" variant="outlined" icon={<ShieldIcon sx={{ fontSize: 14 }} />} label={`${fmtFame(b.totalFame)} ${t('battles.fame')}`} />
                                            </Stack>
                                        </Box>
                                        {b.guilds?.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1 }} />
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {b.guilds.map((g, i) => (
                                                        <Chip key={i} size="small" variant="outlined"
                                                            label={`${g.name} · ${g.kills}/${g.deaths}`}
                                                            sx={{ fontSize: 11 }} />
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default Battles;
