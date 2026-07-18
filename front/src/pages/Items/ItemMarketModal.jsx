import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, CircularProgress, Alert, Tooltip, IconButton,
    FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api';
import { useAccentColors } from '../../hooks/useAccentColors';

const CITIES = ['Brecilien', 'Bridgewatch', 'Caerleon', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Black Market'];

const CITY_COLORS = {
    Brecilien: '#a855f7', Bridgewatch: '#f97316', Caerleon: '#ef4444',
    'Fort Sterling': '#60a5fa', Lymhurst: '#4ade80', Martlock: '#38bdf8',
    Thetford: '#facc15', 'Black Market': '#94a3b8',
};

const fmt = n => n > 0 ? n.toLocaleString() : '—';

const formatDate = iso => {
    if (!iso || iso.startsWith('0001')) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const buildHistoryChartData = (history) => {
    const byDate = {};
    (history || []).forEach(({ location, data }) => {
        (data || []).forEach(({ timestamp, avg_price }) => {
            const date = timestamp.split('T')[0];
            if (!byDate[date]) byDate[date] = { date };
            byDate[date][location] = avg_price;
        });
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
};

const ItemMarketModal = ({ item, onClose }) => {
    const { t } = useTranslation();
    const accents = useAccentColors();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [errorSeverity, setErrorSeverity] = useState('error');
    const [quality, setQuality] = useState(1);

    const loadData = useCallback(async (q = quality) => {
        setLoading(true);
        setError('');
        setErrorSeverity('error');
        try {
            const res = await api.get(`/items/${item.uniqueName}/market?quality=${q}`);
            setData(res.data);
        } catch {
            setError(t('items.market_load_error'));
        } finally {
            setLoading(false);
        }
    }, [item.uniqueName, quality]);

    useEffect(() => { loadData(quality); }, [quality]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setError('');
        setErrorSeverity('error');
        try {
            const res = await api.post(`/items/${item.uniqueName}/market/refresh?quality=${quality}`);
            if (res.data.refreshBlocked) {
                setErrorSeverity('warning');
                setError(t('items.refresh_blocked', { minutes: res.data.minutesLeft }));
            } else {
                setData(res.data);
            }
        } catch {
            setError(t('items.refresh_error'));
        } finally {
            setRefreshing(false);
        }
    };

    const chartData = data ? buildHistoryChartData(data.history) : [];
    const activeCities = CITIES.filter(c => chartData.some(d => d[c] > 0));

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid rgba(201,168,76,0.3)' } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
                <Box
                    component="img"
                    src={item.iconUrl}
                    alt={item.name}
                    sx={{ width: 40, height: 40, imageRendering: 'pixelated' }}
                    onError={e => { e.target.style.display = 'none'; }}
                />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.uniqueName}</Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 130, mr: 1 }}>
                    <InputLabel>{t('items.quality_label')}</InputLabel>
                    <Select value={quality} label={t('items.quality_label')} onChange={e => setQuality(e.target.value)}>
                        <MenuItem value={1}>{t('items.quality_normal')}</MenuItem>
                        <MenuItem value={2}>{t('items.quality_good')}</MenuItem>
                        <MenuItem value={3}>{t('items.quality_outstanding')}</MenuItem>
                        <MenuItem value={4}>{t('items.quality_excellent')}</MenuItem>
                        <MenuItem value={5}>{t('items.quality_masterpiece')}</MenuItem>
                    </Select>
                </FormControl>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {data && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                    {t('items.updated_at', { date: new Date(data.updatedAt).toLocaleString() })}
                                </Typography>
                            )}
                            <Tooltip title={data?.canRefresh ? t('items.refresh_tooltip') : t('items.refresh_wait', { minutes: data?.minutesLeft })}>
                                <span>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={refreshing ? <CircularProgress size={14} /> : <RefreshIcon />}
                                        onClick={handleRefresh}
                                        disabled={refreshing || !data?.canRefresh}
                                        sx={{ ml: 'auto' }}
                                    >
                                        {data?.canRefresh ? t('items.refresh_btn') : t('items.refresh_minutes', { minutes: data?.minutesLeft })}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>

                        {error && <Alert severity={errorSeverity} sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                        {/* Tableau des prix par ville */}
                        <Typography variant="subtitle1" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 600, mb: 1 }}>
                            {t('items.prices_by_city')}
                        </Typography>
                        <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid rgba(201,168,76,0.15)' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>{t('items.col_city')}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.green, fontWeight: 700 }}>{t('items.col_sell_min')}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.green, fontWeight: 700 }}>{t('items.col_sell_max')}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.orange, fontWeight: 700 }}>{t('items.col_buy_min')}</TableCell>
                                        <TableCell align="right" sx={{ color: accents.orange, fontWeight: 700 }}>{t('items.col_buy_max')}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11 }}>{t('items.col_last_update')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {CITIES.map(city => {
                                        const p = (data?.prices || []).find(pr => pr.city === city);
                                        const hasData = p && (p.sell_price_min > 0 || p.buy_price_min > 0);
                                        return (
                                            <TableRow key={city} sx={{ opacity: hasData ? 1 : 0.4, '&:hover': { bgcolor: 'rgba(201,168,76,0.05)' } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CITY_COLORS[city] }} />
                                                        {city}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: accents.green }}>{fmt(p?.sell_price_min)}</TableCell>
                                                <TableCell align="right" sx={{ color: accents.green }}>{fmt(p?.sell_price_max)}</TableCell>
                                                <TableCell align="right" sx={{ color: accents.orange }}>{fmt(p?.buy_price_min)}</TableCell>
                                                <TableCell align="right" sx={{ color: accents.orange }}>{fmt(p?.buy_price_max)}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: 11, color: 'text.secondary' }}>
                                                    {formatDate(p?.sell_price_min_date)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Graphique historique */}
                        <Typography variant="subtitle1" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 600, mb: 1 }}>
                            {t('items.price_history_title')}
                        </Typography>
                        {chartData.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                {t('items.no_history')}
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        tickFormatter={d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                    />
                                    <YAxis
                                        tick={{ fill: '#888', fontSize: 11 }}
                                        tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                    />
                                    <ChartTooltip
                                        contentStyle={{ backgroundColor: '#1e1a10', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 4 }}
                                        labelStyle={{ color: '#c9a84c', fontFamily: 'Cinzel, serif' }}
                                        formatter={(v, name) => [v.toLocaleString() + ' silver', name]}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    {activeCities.map(city => (
                                        <Line
                                            key={city}
                                            type="monotone"
                                            dataKey={city}
                                            stroke={CITY_COLORS[city]}
                                            dot={false}
                                            strokeWidth={2}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ItemMarketModal;
