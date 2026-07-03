import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Typography, Box, CircularProgress, Alert, Accordion, AccordionSummary,
    AccordionDetails, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import frTranslation from '../../locales/fr/translation.json';

// Aplati { nav: { dashboard: 'x' } } -> { 'nav.dashboard': 'x' }
const flatten = (obj, prefix = '') =>
    Object.entries(obj).reduce((acc, [k, v]) => {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.assign(acc, flatten(v, key));
        } else {
            acc[key] = v;
        }
        return acc;
    }, {});

// Reconstruit l'objet imbriqué à partir des chemins pointés.
const unflatten = (flat) => {
    const out = {};
    for (const [path, val] of Object.entries(flat)) {
        const parts = path.split('.');
        let cur = out;
        parts.forEach((p, i) => {
            if (i === parts.length - 1) cur[p] = val;
            else cur = (cur[p] = cur[p] || {});
        });
    }
    return out;
};

// Clés + valeurs de référence (fr), source de vérité de la structure.
const REF_FLAT = flatten(frTranslation);
const REF_GROUPS = Object.keys(REF_FLAT).reduce((g, k) => {
    const top = k.split('.')[0];
    (g[top] = g[top] || []).push(k);
    return g;
}, {});

const LanguageEditor = ({ open, langCode, onClose, onSaved }) => {
    const { t } = useTranslation();
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !langCode) return;
        setLoading(true);
        setError('');
        api.get(`/locales/${langCode}`)
            .then((res) => setValues(flatten(res.data)))
            .catch(() => setError(t('common.error')))
            .finally(() => setLoading(false));
    }, [open, langCode, t]);

    const translatedCount = useMemo(
        () => Object.keys(REF_FLAT).filter((k) => (values[k] || '').trim() !== '').length,
        [values],
    );
    const totalCount = Object.keys(REF_FLAT).length;

    const handleChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.put(`/admin/locales/${langCode}`, { translations: unflatten(values) });
            onSaved?.();
            onClose();
        } catch {
            setError(t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', gap: 1 }}>
                {t('admin.edit_translations', { lng: langCode })}
                <Chip
                    size="small"
                    label={`${translatedCount}/${totalCount}`}
                    color={translatedCount === totalCount ? 'success' : 'default'}
                />
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                    Object.entries(REF_GROUPS).map(([group, keys]) => (
                        <Accordion key={group} disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem' }}>
                                    {group} ({keys.filter((k) => (values[k] || '').trim() !== '').length}/{keys.length})
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {keys.map((key) => (
                                        <TextField
                                            key={key}
                                            label={key}
                                            placeholder={REF_FLAT[key]}
                                            helperText={REF_FLAT[key]}
                                            value={values[key] ?? ''}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={saving || loading}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LanguageEditor;
