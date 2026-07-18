import React, { useState, useCallback } from 'react';
import {
    Box, Card, CardContent, Tabs, Tab, Typography, Stack, CircularProgress,
    Button, Grid2, Paper, Table, TableBody, TableCell, TableHead, TableRow, Alert,
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import AssessmentIcon from '@mui/icons-material/Assessment';
import api from '../../api';
import KillEventCard from '../../components/albion/KillEventCard';
import { fmtFame, fmtDate } from '../../components/albion/albionFormat';
import { useTranslation } from 'react-i18next';
import { useAccentColors } from '../../hooks/useAccentColors';

const StatBox = ({ label, value, color }) => (
    <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: color || 'text.primary' }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
);

const SessionReport = ({ report }) => {
    const { t } = useTranslation();
    const accents = useAccentColors();
    if (!report) return null;
    const totals = report.totals;
    return (
        <Box>
            <Grid2 container spacing={2} sx={{ mb: 2 }}>
                <Grid2 size={{ xs: 6, sm: 3 }}><StatBox label={t('pvp.kills')} value={totals.kills} color={accents.green} /></Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}><StatBox label={t('pvp.deaths')} value={totals.deaths} color={accents.red} /></Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}><StatBox label={t('pvp.kd')} value={totals.kd} /></Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}><StatBox label={t('pvp.net_fame')} value={fmtFame(totals.netFame)} color="primary.main" /></Grid2>
            </Grid2>
            <Typography variant="caption" color="text.secondary">
                {t('pvp.window_label')} : {fmtDate(report.window.from)} → {fmtDate(report.window.to)} ·
                {' '}+{fmtFame(totals.killFame)} {t('pvp.kill_fame_inflicted')} / −{fmtFame(totals.deathFame)} {t('pvp.death_fame_received')}
            </Typography>

            {report.roster?.length > 0 && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            {t('pvp.team_ranking')}
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>{t('pvp.col_player')}</TableCell>
                                    <TableCell align="right">{t('pvp.kills')}</TableCell>
                                    <TableCell align="right">{t('pvp.col_damage')}</TableCell>
                                    <TableCell align="right">{t('pvp.col_healing')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {report.roster.map((r, i) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{r.name}{r.guildName ? ` [${r.guildName}]` : ''}</TableCell>
                                        <TableCell align="right">{r.kills}</TableCell>
                                        <TableCell align="right">{fmtFame(r.damageDone)}</TableCell>
                                        <TableCell align="right">{fmtFame(r.healingDone)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {report.bestKill && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('pvp.best_kill')}</Typography>
                    <KillEventCard event={report.bestKill} perspective="kill" />
                </Box>
            )}
        </Box>
    );
};

const PlayerPvP = ({ playerId }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);
    const [data, setData] = useState({ kills: null, deaths: null, session: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchFor = useCallback(async (key, url) => {
        if (data[key]) return;
        setLoading(true); setError('');
        try {
            const res = await api.get(url);
            setData(prev => ({ ...prev, [key]: res.data }));
        } catch {
            setError(t('pvp.error_fetch'));
        } finally {
            setLoading(false);
        }
    }, [data]);

    const handleTab = (_, v) => {
        setTab(v);
        if (v === 0) fetchFor('kills', `/player/${playerId}/kills?limit=20`);
        if (v === 1) fetchFor('deaths', `/player/${playerId}/deaths?limit=20`);
        if (v === 2) fetchFor('session', `/player/${playerId}/session?limit=50`);
    };

    // charge l'onglet Kills au montage
    React.useEffect(() => {
        fetchFor('kills', `/player/${playerId}/kills?limit=20`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerId]);

    const renderList = (events, perspective) => {
        if (!events) return null;
        if (events.length === 0) {
            return <Alert severity="info">{t('pvp.no_recent_event')}</Alert>;
        }
        return (
            <Stack spacing={1}>
                {events.map((e, i) => <KillEventCard key={e.eventId || i} event={e} perspective={perspective} />)}
            </Stack>
        );
    };

    return (
        <Card sx={{ mt: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SportsKabaddiIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>{t('pvp.activity_title')}</Typography>
                </Box>
                <Tabs value={tab} onChange={handleTab} sx={{ mb: 2 }}>
                    <Tab label={t('pvp.kills')} />
                    <Tab label={t('pvp.deaths')} />
                    <Tab icon={<AssessmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={t('pvp.session_report')} />
                </Tabs>

                {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

                {!loading && (
                    <>
                        {tab === 0 && renderList(data.kills, 'kill')}
                        {tab === 1 && renderList(data.deaths, 'death')}
                        {tab === 2 && (
                            data.session
                                ? <SessionReport report={data.session} />
                                : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Button variant="contained" startIcon={<AssessmentIcon />}
                                            onClick={() => fetchFor('session', `/player/${playerId}/session?limit=50`)}>
                                            {t('pvp.fetch_session')}
                                        </Button>
                                    </Box>
                                )
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PlayerPvP;
