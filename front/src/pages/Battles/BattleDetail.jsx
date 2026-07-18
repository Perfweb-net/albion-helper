import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid2, CircularProgress, Alert, Stack,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, Divider, Tabs, Tab,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import HealingIcon from '@mui/icons-material/Healing';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import KillEventCard from '../../components/albion/KillEventCard';
import { fmtFame } from '../../components/albion/albionFormat';
import { useAccentColors } from '../../hooks/useAccentColors';

const MvpCard = ({ icon, label, player, metric, color }) => (
    <Card variant="outlined" sx={{ height: '100%', borderTop: `3px solid ${color}` }}>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography variant="subtitle1" fontWeight={700} noWrap>{player?.name || '—'}</Typography>
            <Typography variant="body2" sx={{ color }}>{player ? metric(player) : ''}</Typography>
        </CardContent>
    </Card>
);

const BattleDetail = ({ battleId }) => {
    const { t } = useTranslation();
    const accents = useAccentColors();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true); setError('');
        api.get(`/battles/${battleId}`)
            .then(res => { if (active) setData(res.data); })
            .catch(() => { if (active) setError(t('battles.load_detail_error')); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [battleId]);

    if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="warning">{error}</Alert>;
    if (!data) return null;

    const mvp = data.mvp;

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>{t('battles.battle_title', { id: data.battleId })}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    <Chip icon={<ShieldIcon sx={{ fontSize: 16 }} />} label={`${data.killCount} ${t('battles.kills')}`} />
                    <Chip variant="outlined" label={`${fmtFame(data.totalFame)} ${t('battles.total_fame')}`} />
                    <Chip variant="outlined" label={`${data.players.length} ${t('battles.players')}`} />
                    <Chip variant="outlined" label={`${data.factions.length} ${t('battles.guilds')}`} />
                </Stack>
            </Box>

            <Grid2 container spacing={2} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 6, md: 3 }}>
                    <MvpCard icon={<EmojiEventsIcon />} color="#ffd700" label={t('battles.mvp_top_fragger')} player={mvp.topKiller}
                        metric={(p) => `${p.kills} ${t('battles.kills')}`} />
                </Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}>
                    <MvpCard icon={<ShieldIcon />} color="primary.main" label={t('battles.mvp_top_fame')} player={mvp.topFame}
                        metric={(p) => `${fmtFame(p.fame)} ${t('battles.fame')}`} />
                </Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}>
                    <MvpCard icon={<WhatshotIcon />} color={accents.red} label={t('battles.mvp_top_damage')} player={mvp.topDamage}
                        metric={(p) => `${fmtFame(p.damageDone)} ${t('battles.dmg')}`} />
                </Grid2>
                <Grid2 size={{ xs: 6, md: 3 }}>
                    <MvpCard icon={<HealingIcon />} color={accents.green} label={t('battles.mvp_top_healer')} player={mvp.topHealer}
                        metric={(p) => `${fmtFame(p.healingDone)} ${t('battles.heal')}`} />
                </Grid2>
            </Grid2>

            <Card>
                <CardContent>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                        <Tab label={t('battles.tab_players', { count: data.players.length })} />
                        <Tab label={t('battles.tab_guilds', { count: data.factions.length })} />
                        <Tab label={t('battles.tab_kills', { count: data.events.length })} />
                    </Tabs>

                    {tab === 0 && (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell><TableCell>{t('battles.col_player')}</TableCell><TableCell>{t('battles.col_guild')}</TableCell>
                                    <TableCell align="right">{t('battles.col_kills')}</TableCell><TableCell align="right">{t('battles.col_deaths')}</TableCell>
                                    <TableCell align="right">{t('battles.col_fame')}</TableCell><TableCell align="right">{t('battles.col_damage')}</TableCell>
                                    <TableCell align="right">{t('battles.col_healing')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.players.map((p, i) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.extra || '—'}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.green }}>{p.kills}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.red }}>{p.deaths}</TableCell>
                                        <TableCell align="right">{fmtFame(p.fame)}</TableCell>
                                        <TableCell align="right">{fmtFame(p.damageDone)}</TableCell>
                                        <TableCell align="right">{fmtFame(p.healingDone)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {tab === 1 && (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell><TableCell>{t('battles.col_guild')}</TableCell><TableCell>{t('battles.col_alliance')}</TableCell>
                                    <TableCell align="right">{t('battles.col_kills')}</TableCell><TableCell align="right">{t('battles.col_deaths')}</TableCell>
                                    <TableCell align="right">{t('battles.col_fame')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.factions.map((f, i) => (
                                    <TableRow key={f.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{f.name}</TableCell>
                                        <TableCell>{f.extra || '—'}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.green }}>{f.kills}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.red }}>{f.deaths}</TableCell>
                                        <TableCell align="right">{fmtFame(f.fame)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {tab === 2 && (
                        <Stack spacing={1}>
                            {data.events.map((e, i) => <KillEventCard key={e.eventId || i} event={e} perspective="kill" />)}
                            {data.killCount > data.events.length && (
                                <>
                                    <Divider />
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                                        {t('battles.kills_displayed', { shown: data.events.length, total: data.killCount })}
                                    </Typography>
                                </>
                            )}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default BattleDetail;
