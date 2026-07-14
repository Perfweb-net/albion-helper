import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button, TextField,
    IconButton, Chip, Alert, CircularProgress, Tooltip, Snackbar, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import './Routes.scss';

const MAX_ZONES = 8;

const ZoneAutocomplete = ({ value, onChange, label }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounce = useRef(null);

    const handleInputChange = (_, inputValue) => {
        clearTimeout(debounce.current);
        if (inputValue.length < 2) { setOptions([]); return; }
        debounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/zones/autocomplete?q=${encodeURIComponent(inputValue)}`);
                setOptions(res.data);
            } catch { setOptions([]); }
            finally { setLoading(false); }
        }, 250);
    };

    return (
        <Autocomplete
            freeSolo
            options={options}
            loading={loading}
            inputValue={value}
            onInputChange={(_, val) => { onChange(val); handleInputChange(_, val); }}
            sx={{ flex: 1, minWidth: 0 }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    size="small"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={14} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

const timeUntilExpiry = (expiresAt) => {
    const diff = new Date(expiresAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { h, m };
};

const Routes = () => {
    const { t } = useTranslation();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newRoute, setNewRoute] = useState({ name: '', zones: [{ zoneName: '', timerHours: 0, timerMins: 30 }] });
    const [formError, setFormError] = useState('');
    const [snackbar, setSnackbar] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchRoutes = useCallback(async () => {
        try {
            const res = await api.get('/routes');
            setRoutes(res.data);
        } catch {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

    const handleAddZone = () => {
        if (newRoute.zones.length >= MAX_ZONES) return;
        setNewRoute(r => ({ ...r, zones: [...r.zones, { zoneName: '', timerHours: 0, timerMins: 30 }] }));
    };

    const handleRemoveZone = (idx) => {
        setNewRoute(r => ({ ...r, zones: r.zones.filter((_, i) => i !== idx) }));
    };

    const handleZoneChange = (idx, field, value) => {
        setNewRoute(r => {
            const zones = [...r.zones];
            zones[idx] = { ...zones[idx], [field]: value };
            return { ...r, zones };
        });
    };

    const handleCreate = async () => {
        if (!newRoute.name.trim()) { setFormError(t('routes.name_required')); return; }
        if (newRoute.zones.some(z => !z.zoneName.trim())) { setFormError(t('routes.zone_name_required')); return; }
        setFormError('');
        setCreating(true);
        try {
            await api.post('/routes', {
                name: newRoute.name,
                zones: newRoute.zones.map((z, i) => ({
                    zoneName: z.zoneName,
                    position: i + 1,
                    timerMinutes: (parseInt(z.timerHours, 10) || 0) * 60 + (parseInt(z.timerMins, 10) || 0) || 1
                }))
            });
            setNewRoute({ name: '', zones: [{ zoneName: '', timerHours: 0, timerMins: 30 }] });
            setShowForm(false);
            fetchRoutes();
        } catch (e) {
            setFormError(e.response?.data?.error || t('common.error'));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/routes/${id}`);
            setRoutes(r => r.filter(rt => rt.id !== id));
        } catch {
            setError(t('common.error'));
        }
    };

    const handleShare = (shareToken) => {
        const url = `${window.location.origin}/routes/share/${shareToken}`;
        navigator.clipboard.writeText(url).then(() => setSnackbar(t('routes.link_copied')));
    };

    return (
        <Container maxWidth="lg" className="routes__container">
            <Box className="routes__header">
                <RouteIcon className="routes__icon" />
                <Typography variant="h3" className="routes__title ah-page-title">{t('routes.title')}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(v => !v)}
                    className="routes__create-btn"
                >
                    {t('routes.create')}
                </Button>
            </Box>

            {showForm && (
                <Card className="routes__form-card">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>{t('routes.create')}</Typography>
                        <TextField
                            label={t('routes.name_label')}
                            value={newRoute.name}
                            onChange={e => setNewRoute(r => ({ ...r, name: e.target.value }))}
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        {newRoute.zones.map((zone, idx) => (
                            <Box key={idx} className="routes__zone-row">
                                <Typography variant="body2" className="routes__zone-number">{idx + 1}</Typography>
                                <ZoneAutocomplete
                                    label={t('routes.zone_label')}
                                    value={zone.zoneName}
                                    onChange={val => handleZoneChange(idx, 'zoneName', val)}
                                />
                                <TextField
                                    label={t('routes.hours')}
                                    type="number"
                                    value={zone.timerHours}
                                    onChange={e => handleZoneChange(idx, 'timerHours', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                    size="small"
                                    inputProps={{ min: 0, max: 23 }}
                                    sx={{ width: 64 }}
                                />
                                <TextField
                                    label={t('routes.minutes')}
                                    type="number"
                                    value={zone.timerMins}
                                    onChange={e => handleZoneChange(idx, 'timerMins', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                    size="small"
                                    inputProps={{ min: 0, max: 59 }}
                                    sx={{ width: 72 }}
                                />
                                {newRoute.zones.length > 1 && (
                                    <IconButton onClick={() => handleRemoveZone(idx)} color="error" size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>
                        ))}

                        {newRoute.zones.length < MAX_ZONES ? (
                            <Button startIcon={<AddIcon />} onClick={handleAddZone} size="small" sx={{ mt: 1 }}>
                                {t('routes.add_zone')}
                            </Button>
                        ) : (
                            <Typography variant="caption" color="warning.main">{t('routes.max_zones')}</Typography>
                        )}

                        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleCreate}
                                disabled={creating}
                                startIcon={creating ? <CircularProgress size={16} /> : null}
                            >
                                {t('routes.save')}
                            </Button>
                            <Button variant="outlined" onClick={() => setShowForm(false)}>
                                {t('common.cancel')}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : routes.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                    {t('routes.no_routes')}
                </Typography>
            ) : (
                <Box className="routes__list">
                    {routes.map(route => {
                        const timeLeft = timeUntilExpiry(route.expiresAt);
                        return (
                            <Card key={route.id} className="routes__route-card">
                                <CardContent>
                                    <Box className="routes__route-header">
                                        <Typography variant="h6" className="routes__route-name">{route.name}</Typography>
                                        <Box className="routes__route-actions">
                                            {timeLeft ? (
                                                <Chip
                                                    icon={<AccessTimeIcon />}
                                                    label={`${timeLeft.h}${t('routes.hours')} ${timeLeft.m}${t('routes.minutes')}`}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip label={t('routes.expired')} size="small" color="error" />
                                            )}
                                            <Tooltip title={t('routes.copy_link')}>
                                                <IconButton onClick={() => handleShare(route.shareToken)} size="small" color="primary">
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('routes.delete')}>
                                                <IconButton onClick={() => handleDelete(route.id)} size="small" color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    <Box className="routes__zones">
                                        {route.zones?.sort((a, b) => a.position - b.position).map((zone, idx) => (
                                            <Box key={idx} className="routes__zone-chip-row">
                                                <Chip
                                                    label={`${idx + 1}. ${zone.zoneName}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {zone.timerMinutes >= 60
                                                        ? `${Math.floor(zone.timerMinutes / 60)}${t('routes.hours')} ${zone.timerMinutes % 60 > 0 ? `${zone.timerMinutes % 60}${t('routes.minutes')}` : ''}`
                                                        : `${zone.timerMinutes}${t('routes.minutes')}`}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            <Snackbar
                open={!!snackbar}
                autoHideDuration={2500}
                onClose={() => setSnackbar('')}
                message={snackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default Routes;
